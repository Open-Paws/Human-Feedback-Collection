import { Radio, RadioGroup } from "@chakra-ui/react";
import { PropsWithChildren, useEffect, useState } from "react";

export const LikertButtons = ({
  isDisabled,
  count,
  onChange,
  currentValue = undefined,
  "data-cy": dataCy,
}: PropsWithChildren<{
  isDisabled: boolean;
  count: number;
  onChange: (value: number) => void;
  currentValue?: number;
  "data-cy"?: string;
}>) => {
  const valueMap = Object.fromEntries(Array.from({ length: count }, (_, idx) => [`${idx}`, idx / (count - 1)]));

  // This shadows the RadioGroup's value. This enables us to set a default value after
  // a network call completes. RadioGroup has a `defaultValue` prop, but it's only used
  // when the component is initialized.
  const [currentLabel, setCurrentLabel] = useState<string>("");
  useEffect(() => {
    Object.keys(valueMap).forEach((k) => {
      const v = valueMap[k]
      if (currentValue !== undefined && currentValue !== null && Math.abs(currentValue - v) < 0.0001) {
        setCurrentLabel(k);
      }
    });
  }, [currentValue]);

  return (
    <RadioGroup
      data-cy={dataCy}
      isDisabled={isDisabled}
      onChange={(value) => {
        setCurrentLabel(value);
        onChange(valueMap[value]);
      }}
      style={{ display: "flex", justifyContent: "space-between" }}
      value={currentLabel}
    >
      {Object.keys(valueMap).map((value) => {
        return (
          <Radio key={value} value={value} borderColor="gray.400" data-cy="radio-option" size="md" padding="0.6em" />
        );
      })}
    </RadioGroup>
  );
};
