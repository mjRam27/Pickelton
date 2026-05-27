// pickelton-app/packages/utils/src/validation.ts
export const indianPhonePattern = /^\+?[1-9][0-9]{7,14}$/;

export function isValidPhoneNumber(value: string): boolean {
  return indianPhonePattern.test(value.trim());
}
