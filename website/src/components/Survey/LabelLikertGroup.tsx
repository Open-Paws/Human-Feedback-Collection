import { Box, Grid, GridItem, Text, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";
import React from "react";
import { useEffect, useState } from "react";
import { LikertButtons } from "src/components/Buttons/LikertButtons";
import { Explain } from "src/components/Explain";

interface LabelInputGroupProps {
  labelIDs: Array<string>;
  onChange: (values: number[]) => unknown;
  isEditable?: boolean;
  currentValues?: number[];
}

interface LabelInfo {
  zeroText: string;
  oneText: string;
  zeroDescription: string[];
  oneDescription: string[];
  inverted: boolean;
}

export const getLabelInfo = (label: string, t: (key: string) => string): LabelInfo => {
  switch (label) {
    case "spam":
      return {
        zeroText: t("not_spam"),
        zeroDescription: [t("not_spam.explanation")],
        oneText: t("spam"),
        oneDescription: [
          t("spam.one_desc.line_1"),
          t("spam.one_desc.line_2"),
          t("spam.one_desc.line_3"),
          t("spam.one_desc.line_4"),
        ],
        inverted: true,
      };
    case "fails_task":
      return {
        zeroText: t("follows_instructions"),
        zeroDescription: [],
        oneText: t("fails_task"),
        oneDescription: [t("fails_task.one_desc")],
        inverted: true,
      };
    case "not_appropriate":
      return {
        zeroText: t("appropriate"),
        zeroDescription: [],
        oneText: t("inappropriate"),
        oneDescription: [t("inappropriate.one_desc")],
        inverted: true,
      };
    case "violence":
      return {
        zeroText: t("harmless"),
        zeroDescription: [],
        oneText: t("violent"),
        oneDescription: [t("violent.one_desc")],
        inverted: true,
      };
    case "excessive_harm":
      return {
        zeroText: t("safe"),
        zeroDescription: [],
        oneText: t("harmful"),
        oneDescription: [t("harmful.one_desc.line_1"), t("harmful.one_desc.line_2")],
        inverted: true,
      };
    case "sexual_content":
      return {
        zeroText: t("non_sexual"),
        zeroDescription: [],
        oneText: t("sexual"),
        oneDescription: [t("sexual.one_desc")],
        inverted: true,
      };
    case "toxicity":
      return {
        zeroText: t("polite"),
        zeroDescription: [],
        oneText: t("rude"),
        oneDescription: [t("rude.one_desc")],
        inverted: true,
      };
    case "moral_judgement":
      return {
        zeroText: t("non_judgemental"),
        zeroDescription: [],
        oneText: t("judgemental"),
        oneDescription: [t("judgemental.one_desc")],
        inverted: true,
      };
    case "political_content":
      return {
        zeroText: t("apolitical"),
        zeroDescription: [],
        oneText: t("political"),
        oneDescription: [t("political.one_desc")],
        inverted: true,
      };
    case "humor":
      return {
        zeroText: t("serious"),
        zeroDescription: [],
        oneText: t("humorous"),
        oneDescription: [t("humorous.one_desc")],
        inverted: false,
      };
    case "hate_speech":
      return {
        zeroText: t("safe"),
        zeroDescription: [],
        oneText: t("hateful"),
        oneDescription: [t("hateful.one_desc.line_1"), t("hateful.one_desc.line_2")],
        inverted: true,
      };
    case "threat":
      return {
        zeroText: t("safe"),
        zeroDescription: [],
        oneText: t("threatening"),
        oneDescription: [t("threatening.one_desc")],
        inverted: true,
      };
    case "misleading":
      return {
        zeroText: t("accurate"),
        zeroDescription: [],
        oneText: t("misleading"),
        oneDescription: [t("misleading.one_desc")],
        inverted: true,
      };
    case "helpfulness":
      return {
        zeroText: t("unhelpful"),
        zeroDescription: [],
        oneText: t("helpful"),
        oneDescription: [t("helpful.one_desc")],
        inverted: false,
      };
    case "creative":
      return {
        zeroText: t("boring"),
        zeroDescription: [],
        oneText: t("creative"),
        oneDescription: [t("creative.one_desc")],
        inverted: false,
      };
    case "pii":
      return {
        zeroText: t("clean"),
        zeroDescription: [],
        oneText: t("contains_pii"),
        oneDescription: [t("contains_pii.one_desc")],
        inverted: false,
      };
    case "quality":
      return {
        zeroText: t("low_quality"),
        zeroDescription: [],
        oneText: t("high_quality"),
        oneDescription: [],
        inverted: false,
      };
    case "creativity":
      return {
        zeroText: t("ordinary"),
        zeroDescription: [],
        oneText: t("creative"),
        oneDescription: [t("creative.one_desc.line_1"), t("creative.one_desc.line_2")],
        inverted: false,
      };
    case "harmful_to_animals":
      return {
        zeroText: t("harmful_to_animals.zero_text"),
        zeroDescription: [],
        oneText: t("harmful_to_animals.one_text"),
        oneDescription: [t("harmful_to_animals.one_desc")],
        inverted: true,
      };
    case "animal_effect":
      return {
        zeroText: t("animal_effect.zero"),
        zeroDescription: [],
        oneText: t("animal_effect.one"),
        oneDescription: [t("animal_effect.one_desc")],
        inverted: false,
      };
    case "cultural_inclusion":
      return {
        zeroText: t("cultural_inclusion.zero"),
        zeroDescription: [],
        oneText: t("cultural_inclusion.one"),
        oneDescription: [t("cultural_inclusion.one_desc")],
        inverted: false,
      };
    case "emotional_effect":
      return {
        zeroText: t("emotional_effect.zero"),
        zeroDescription: [],
        oneText: t("emotional_effect.one"),
        oneDescription: [t("emotional_effect.one_desc")],
        inverted: false,
      };
    case "factuality":
      return {
        zeroText: t("factuality.zero"),
        zeroDescription: [],
        oneText: t("factuality.one"),
        oneDescription: [t("factuality.one_desc")],
        inverted: false,
      };
    case "influence":
      return {
        zeroText: t("influence.zero"),
        zeroDescription: [],
        oneText: t("influence.one"),
        oneDescription: [t("influence.one_desc")],
        inverted: false,
      };
    case "logical":
      return {
        zeroText: t("logical.zero"),
        zeroDescription: [],
        oneText: t("logical.one"),
        oneDescription: [t("logical.one_desc")],
        inverted: false,
      };
    case "advocacy_approach":
      return {
        zeroText: t("advocacy_approach.zero"),
        zeroDescription: [],
        oneText: t("advocacy_approach.one"),
        oneDescription: [],
        inverted: false,
      };
    case "advocacy_diplomacy":
      return {
        zeroText: t("advocacy_diplomacy.zero"),
        zeroDescription: [],
        oneText: t("advocacy_diplomacy.one"),
        oneDescription: [],
        inverted: false,
      };
    case "advocacy_empiricism":
      return {
        zeroText: t("advocacy_empiricism.zero"),
        zeroDescription: [],
        oneText: t("advocacy_empiricism.one"),
        oneDescription: [],
        inverted: false,
      };
    case "advocacy_focus":
      return {
        zeroText: t("advocacy_focus.zero"),
        zeroDescription: [],
        oneText: t("advocacy_focus.one"),
        oneDescription: [],
        inverted: false,
      };
    case "advocacy_intersectionality":
      return {
        zeroText: t("advocacy_intersectionality.zero"),
        zeroDescription: [],
        oneText: t("advocacy_intersectionality.one"),
        oneDescription: [],
        inverted: false,
      };
    case "advocacy_rights":
      return {
        zeroText: t("advocacy_rights.zero"),
        zeroDescription: [],
        oneText: t("advocacy_rights.one"),
        oneDescription: [],
        inverted: false,
      };

    default:
      return {
        zeroText: `!${label}`,
        zeroDescription: [],
        oneText: label,
        oneDescription: [],
        inverted: false,
      };
  }
};

export const LabelLikertGroup = ({ labelIDs, onChange, isEditable = true, currentValues = undefined }: LabelInputGroupProps) => {
  const { t } = useTranslation("labelling");
  const [labelValues, setLabelValues] = useState<number[]>(Array.from({ length: labelIDs.length }).map(() => null));

  useEffect(() => {
    if (currentValues) {
      setLabelValues(currentValues);
    }
  }, [currentValues]);

  const cardColor = useColorModeValue("gray.50", "gray.800");

  return (
    <Grid templateColumns={"minmax(min-content, 30em)"} rowGap={2}>
      {labelIDs.map((labelId, idx) => {
        const { zeroText, oneText, zeroDescription, oneDescription, inverted } = getLabelInfo(labelId, t);

        let textA = zeroText;
        let textB = oneText;
        let descriptionA = zeroDescription;
        let descriptionB = oneDescription;
        if (inverted) [textA, textB, descriptionA, descriptionB] = [textB, textA, descriptionB, descriptionA];

        return (
          <Box key={idx} padding={2} bg={cardColor} borderRadius="md" position="relative">
            <Grid
              templateColumns={{
                base: "minmax(0, 1fr) minmax(0, 1fr)",
                sm: "minmax(0, 1fr) auto minmax(0, 1fr)",
              }}
              alignItems="center"
            >
              <Text as="div" display="flex" alignItems="center">
                {textA}
                {descriptionA.length > 0 ? <Explain explanation={descriptionA} /> : null}
              </Text>
              <GridItem colSpan={{ base: 2, sm: 1 }} gridColumnStart={{ base: 1, sm: 2 }} gridRow={{ base: 2, sm: 1 }}>
                <LikertButtons
                  currentValue={currentValues && currentValues[idx]}
                  isDisabled={!isEditable}
                  count={5}
                  data-cy="label-options"
                  onChange={(value) => {
                    const newState = labelValues.slice();
                    newState[idx] = value === null ? null : inverted ? 1 - value : value;
                    onChange(newState);
                    setLabelValues(newState);
                  }}
                />
              </GridItem>
              <GridItem>
                <Text as="div" display="flex" alignItems="center" justifyContent="end" textAlign="end">
                  {textB}
                  {descriptionB.length > 0 ? <Explain explanation={descriptionB} /> : null}
                </Text>
              </GridItem>
            </Grid>
          </Box>
        );
      })}
    </Grid>
  );
};
