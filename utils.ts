
/**
 * Generates the image URL for a card based on the specified naming convention.
 * The path assumes a '/Cards' directory exists at the root of the project.
 * @param className - The class of the card (e.g., 'Thief').
 * @param name - The name of the card (e.g., 'James').
 * @returns The expected image URL string.
 */
export const getCardImageUrl = (className: string, name: string): string => {
  return `/Cards/Class_${className}_Name_${name}.jpg`;
};