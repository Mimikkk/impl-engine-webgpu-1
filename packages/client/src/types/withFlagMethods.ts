export const withFlagMethods = <T extends number>(enumeration: object) => {
  const toValues = (stage: T): number[] => {
    if (stage === 0) return [];
    const flags = [];
    while (stage) {
      const bit = stage & (~stage + 1);
      flags.push(bit);
      (stage as number) ^= bit;
    }
    return flags;
  };
  const toNames = (stage: T): string[] => toValues(stage).map(value => enumeration[value as keyof typeof enumeration]);
  const toString = (stage: T) => (stage ? toNames(stage).join(' | ') : 'None');

  return { toValues, toString, toNames } as const;
};
