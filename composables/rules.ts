export const useFormRules = () => {
	const { t } = useI18n();
	return {
		ruleRequired: (v: any) => !!v || t("validation.required"),
		ruleEmail: (value: any) => {
			const pattern =
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return pattern.test(value) || t("validation.email");
		},
		rulePassLen: (v: string) => (!!v && v.length >= 6) || t("validation.passwordLength"),
	};
};
