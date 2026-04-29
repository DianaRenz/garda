<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center" class="fill-height">
      <VCol cols="12" sm="8" md="5" lg="4">
        <div class="text-center mb-8">
          <h1 class="text-h5 font-weight-bold">Garda</h1>
          <p class="text-medium-emphasis text-body-2 mt-1">{{ $t('register.subtitle') }}</p>
        </div>

        <!-- Invalid token state -->
        <VAlert v-if="tokenError" type="error" variant="tonal">
          {{ tokenError === 'expired' ? $t('register.expiredToken') : $t('register.invalidToken') }}
        </VAlert>

        <!-- Loading state -->
        <div v-else-if="validating" class="text-center py-8">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <!-- Email verification sent -->
        <div v-else-if="emailSent" class="text-center py-4">
          <VIcon icon="fluent:mail-checkmark-24-regular" size="64" color="primary" class="mb-4" />
          <h2 class="text-h6 font-weight-bold mb-2">{{ $t('register.verifyTitle') }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-6">{{ $t('register.verifyText') }}</p>
          <VBtn to="/login" variant="tonal" color="primary">{{ $t('register.goToLogin') }}</VBtn>
        </div>

        <!-- Registration form -->
        <VForm v-else ref="formRef" @submit.prevent="submit">
          <!-- Guest-only: name and phone -->
          <template v-if="inviteType === 'guest'">
            <div class="mt-1">
              <label class="label text-grey-darken-2" for="name">{{ $t('register.name') }}</label>
              <VTextField
                :rules="[ruleRequired]"
                v-model="name"
                prepend-inner-icon="fluent:person-24-regular"
                id="name"
              />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2" for="phone">{{ $t('register.phone') }}</label>
              <VTextField
                v-model="phone"
                prepend-inner-icon="fluent:phone-24-regular"
                id="phone"
              />
            </div>
          </template>

          <div class="mt-1">
            <label class="label text-grey-darken-2" for="email">{{ $t('register.email') }}</label>
            <VTextField
              :rules="[ruleRequired, ruleEmail]"
              v-model="email"
              prepend-inner-icon="fluent:mail-24-regular"
              id="email"
              type="email"
            />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2" for="password">{{ $t('register.password') }}</label>
            <VTextField
              :rules="[ruleRequired, rulePassLen]"
              v-model="password"
              prepend-inner-icon="fluent:password-20-regular"
              id="password"
              type="password"
            />
          </div>
          <div class="mt-1">
            <label class="label text-grey-darken-2" for="confirm-password">{{ $t('register.confirmPassword') }}</label>
            <VTextField
              :rules="[ruleRequired, rulePasswordMatch]"
              v-model="confirmPassword"
              prepend-inner-icon="fluent:password-20-regular"
              id="confirm-password"
              type="password"
            />
          </div>

          <VAlert v-if="submitError" type="error" class="mt-4" variant="tonal">
            {{ $t(`register.${submitError}`) }}
          </VAlert>

          <div class="mt-6">
            <VBtn type="submit" block min-height="44" class="gradient primary" :loading="loading">
              {{ $t('register.submit') }}
            </VBtn>
          </div>
        </VForm>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
definePageMeta({ layout: "default" });

const { $auth, $db } = useNuxtApp();
const route = useRoute();
const token = route.params.token as string;

const { validateToken } = useInvite();
const { createGuest, linkGuestToUser } = useGuests();
const { ruleRequired, ruleEmail, rulePassLen } = useFormRules();

const validating = ref(true);
const tokenError = ref<string | null>(null);
const inviteType = ref<"admin" | "guest">("admin");
const loading = ref(false);
const submitError = ref<string | null>(null);
const formRef = ref();
const emailSent = ref(false);

const name = ref("");
const phone = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const linkedGuestId = ref<string | null>(null);

const { t } = useI18n();

const rulePasswordMatch = (v: string) =>
  v === password.value || t('register.passwordMismatch');

onMounted(async () => {
  const result = await validateToken(token);
  if (!result.valid) {
    tokenError.value = result.error ?? "not_found";
  } else {
    inviteType.value = result.type ?? "admin";
    // Personal guest invite — prefill form with guest data from invite
    if (result.guestId) {
      linkedGuestId.value = result.guestId;
      if (result.guestData) {
        name.value = result.guestData.name || "";
        phone.value = result.guestData.phone || "";
        email.value = result.guestData.email || "";
      }
    }
  }
  validating.value = false;
});

const submit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  submitError.value = null;
  try {
    const credential = await createUserWithEmailAndPassword($auth, email.value, password.value);
    await runTransaction($db, async (transaction) => {
      const inviteRef = doc($db, "invites", token);
      const inviteSnap = await transaction.get(inviteRef);

      if (!inviteSnap.exists()) throw new Error("invalid_invite");
      const invite = inviteSnap.data();
      if (invite.used) throw new Error("used_invite");
      if (invite.expiresAt.toDate() < new Date()) throw new Error("expired_invite");
      if (invite.type !== inviteType.value) throw new Error("invalid_invite_type");

      transaction.set(doc($db, "users", credential.user.uid), {
        role: inviteType.value,
        email: email.value,
        name: inviteType.value === "guest" ? name.value : null,
        phone: inviteType.value === "guest" ? phone.value : null,
        inviteToken: token,
        createdAt: serverTimestamp(),
      });
      transaction.update(inviteRef, {
        used: true,
        usedAt: serverTimestamp(),
        usedBy: credential.user.uid,
        usedByName: inviteType.value === 'guest' ? name.value : email.value,
      });
    });
    // Link or create guest record
    if (inviteType.value === "guest") {
      if (linkedGuestId.value) {
        // Personal invite → link existing guest + migrate bookings
        await linkGuestToUser(linkedGuestId.value, credential.user.uid, {
          name: name.value,
          phone: phone.value || "",
          email: email.value,
        });
      } else {
        // Generic invite → create new guest record
        createGuest({
          name: name.value,
          phone: phone.value || "",
          email: email.value,
          notes: "",
          userId: credential.user.uid,
        }).catch(() => {}); // best-effort, don't block registration
      }
    }
    // Send verification email (best-effort — don't block registration)
    try { await sendEmailVerification(credential.user); } catch {}
    emailSent.value = true;
  } catch (e: any) {
    if (e?.code === "auth/email-already-in-use") {
      submitError.value = "emailInUse";
    } else {
      submitError.value = "error";
    }
  } finally {
    loading.value = false;
  }
};
</script>
