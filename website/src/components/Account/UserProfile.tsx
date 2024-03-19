import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Input,
  Radio,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import { get, post } from "src/lib/api";
import useSWRImmutable from "swr/immutable";
import useSWRMutation from "swr/mutation";

import { LabelLikertGroup } from "../Survey/LabelLikertGroup";
import { SurveyCard } from "../Survey/SurveyCard";
import { getTypeSafei18nKey } from "src/lib/i18n";

export const MAX_OTHER_LENGTH = 100;

const advocacyApproachOptions = [
  "advocacy_approach",
  "advocacy_focus",
  "advocacy_intersectionality",
  "advocacy_rights",
  "advocacy_diplomacy",
  "advocacy_empiricism",
];

const advocateOptions = [
  { label: "advocate_true", value: "true" },
  { label: "advocate_false", value: "false" },
  { label: "advocate_other", value: "other" },
];

const dietOptions = [
  { label: "diet_regular_meat_eater", value: "regular_meat_eater" },
  { label: "diet_occasional_meat_eater", value: "occasional_meat_eater" },
  { label: "diet_flexitarian", value: "flexitarian" },
  { label: "diet_vegetarian", value: "vegetarian" },
  { label: "diet_vegan", value: "vegan" },
  { label: "diet_other", value: "other" },
];

const roleOptions = [
  { label: "role_volunteer", value: "volunteer" },
  { label: "role_donor", value: "donor" },
  { label: "role_staff", value: "staff" },
  { label: "role_researcher", value: "researcher" },
  { label: "role_independent", value: "independent" },
  { label: "role_legal", value: "legal" },
  { label: "role_rescuer", value: "rescuer" },
  { label: "role_influencer", value: "influencer" },
  { label: "role_company_owner", value: "company_owner" },
  { label: "role_company_staff", value: "comany_staff" },
  { label: "role_investor", value: "investor" },
  { label: "role_other", value: "other" },
];

export interface ProfileData {
  advocacyApproach: { [key: string]: number };
  advocate: string;
  diet: string;
  roles: string[];
}

interface RadioWithOther {
  options: { label: string, value: string }[];
  optionValue: string;
  setOptionValue: (s: string) => void;
  otherValue: string;
  setOtherValue: (s: string) => void;
}

// A component encapsulating a group of Radio buttons where the last option is
// "other" and text box to specify additional details.
const RadioWithOther = (props: RadioWithOther) => {
  const { t } = useTranslation("leaderboard");
  return (
    <Stack marginTop={2}>
      {props.options.map(o => {
        return (
          <Flex onClick={() => props.setOptionValue(o.value)}>
            <Radio isChecked={props.optionValue === o.value} value={o.value}>
              {t(getTypeSafei18nKey(o.label))}
            </Radio>
            {o.value === "other" && (
              <Input
                marginLeft={5}
                placeholder={t(getTypeSafei18nKey("other_please_specify"))}
                size="sm"
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length < MAX_OTHER_LENGTH) {
                    props.setOtherValue(newValue);
                  }
                }}
                value={props.otherValue}
                variant="flushed" width="25rem" />
            )}
          </Flex>);
      })}
    </Stack>
  )
}

export const UserProfile = () => {
  const toast = useToast();
  const { t } = useTranslation("leaderboard");

  const [advocacyApproach, setAdvocacyApproach] = useState(advocacyApproachOptions.map(a => null));

  const [advocate, setAdvocate] = useState("");
  const [otherAdvocate, setOtherAdvocate] = useState("");

  const [diet, setDiet] = useState("");
  const [otherDiet, setOtherDiet] = useState("");

  const [roles, setRoles] = useState<string[]>([]);
  const [otherRole, setOtherRole] = useState("");

  const { data: defaultValues } = useSWRImmutable<ProfileData>("/api/profile", get);
  const { trigger } = useSWRMutation<ProfileData, any, any, ProfileData>("/api/profile", post, {
    onSuccess() {
      toast({
        status: "success",
        title: t(getTypeSafei18nKey("profile_update_success"))
      });
    },
    onError(err) {
      console.error(err);
      toast({
        status: "error",
        title: t(getTypeSafei18nKey("profile_update_failed"))
      });
    },
  })

  const parseOption = (
    options: { label: string, value: string }[],
    response: string,
    setOption: (s: string) => void,
    setOtherOption: (s: string) => void) => {
    if (response === "") {
      setOption("");
      setOtherOption("");
      return;
    }

    const isKnownOption = options.findIndex(o => o.value === response) > -1;
    setOption(isKnownOption ? response : "other");
    setOtherOption(isKnownOption ? "" : response);
  }

  const getOption = (option: string, otherOption: string) =>
    option === "other" && otherOption !== "" ? otherOption : option;

  useEffect(() => {
    // Parse "diet" string
    parseOption(
      dietOptions,
      defaultValues?.diet || "",
      setDiet,
      setOtherDiet);
    // Parse "advocate" string
    parseOption(
      advocateOptions,
      defaultValues?.advocate || "",
      setAdvocate,
      setOtherAdvocate);

    // Parse "roles" array
    const allRoles = defaultValues?.roles || [];
    const knownRoles = allRoles.filter(o => roleOptions.findIndex(i => i.value === o) > -1);
    const unknownRoles = allRoles.filter(o => roleOptions.findIndex(i => i.value === o) === -1);
    setRoles(knownRoles);
    setOtherRole(unknownRoles.join(','));

    // Parse "advocacyApproach" values
    const data = defaultValues?.advocacyApproach || {};
    const advArray = advocacyApproachOptions.map(a => {
      return a in data ? data[a] : null;
    });
    setAdvocacyApproach(advArray);
  }, [defaultValues])

  const canSubmit = useCallback(() =>
    advocacyApproach.findIndex(a => a === null) === -1
    && advocate !== ""
    && diet !== "", [advocacyApproach, advocate, diet]);

  const onSubmit = useCallback(() => {
    const otherRoleIndex = roles.indexOf("other");
    const allRoles = otherRoleIndex > -1 && otherRole !== ""
      ? roles.concat(otherRole)
      : roles;

    const advocacyMap = {};
    advocacyApproachOptions.forEach((a, ix) => {
      advocacyMap[a] = advocacyApproach[ix];
    });

    trigger({
      advocacyApproach: advocacyMap,
      advocate: getOption(advocate, otherAdvocate),
      diet: getOption(diet, otherDiet),
      roles: allRoles,
    });
  }, [advocacyApproach, advocate, otherAdvocate, diet, otherDiet, roles, otherRole, trigger]);

  return (
    <SurveyCard>
      <Text as="b" display="block" fontSize="2xl" py={2}>
        {t("your_profile")}
      </Text>
      <Box marginBottom={5}>
        <Text as="b" fontSize="xl">{t(getTypeSafei18nKey("diet_question"))}</Text>
        <RadioWithOther
          options={dietOptions}
          optionValue={diet}
          setOptionValue={setDiet}
          otherValue={otherDiet}
          setOtherValue={setOtherDiet}
        />
      </Box>

      <Box marginBottom={5}>
        <Text as="b" fontSize="xl">{t(getTypeSafei18nKey("advocate_question"))}</Text>
        <Text fontSize="l">{t(getTypeSafei18nKey("advocate_explanation"))}</Text>
        <RadioWithOther
          options={advocateOptions}
          optionValue={advocate}
          setOptionValue={setAdvocate}
          otherValue={otherAdvocate}
          setOtherValue={setOtherAdvocate}
        />
      </Box>

      <Box marginBottom={5}>
        <Text as="b" fontSize="xl">{t(getTypeSafei18nKey("role_question"))}</Text>
        <CheckboxGroup value={roles} onChange={r => setRoles(r)}>
          <Stack marginTop={2}>
            {roleOptions.map(o =>
              <Flex>
                <Checkbox value={o.value}>{t(getTypeSafei18nKey(o.label))}</Checkbox>
                {o.value === "other" && (<Input
                  marginLeft={5}
                  placeholder={t(getTypeSafei18nKey("other_please_specify"))}
                  size="sm"
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length < MAX_OTHER_LENGTH) {
                      setOtherRole(newValue)
                    }
                  }}
                  value={otherRole}
                  variant="flushed" width="25rem" />)}
              </Flex>
            )}
          </Stack>
        </CheckboxGroup>
      </Box>

      <Box marginBottom={5}>
        <Text as="b" fontSize="xl">{t(getTypeSafei18nKey("advocacy_question"))}</Text>
        <Stack marginTop={2}>
          <LabelLikertGroup
            currentValues={advocacyApproach}
            labelIDs={advocacyApproachOptions}
            onChange={(v) => {
              setAdvocacyApproach(v)
            }}>
          </LabelLikertGroup>
        </Stack>
      </Box>

      <Box>
        <Button onClick={onSubmit} isDisabled={!canSubmit()} size="lg" variant="solid" colorScheme="blue">
          {t(getTypeSafei18nKey("profile_submit"))}
        </Button>
      </Box>
    </SurveyCard>
  );
}