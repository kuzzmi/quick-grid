import { arrayMove as dndKitArrayMove } from "@dnd-kit/sortable";

/**
 * Move an array item from one position to another
 */
export const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
  return dndKitArrayMove(array, from, to);
};

/**
 * Finds indices in an array based on object IDs
 */
export const findIndices = <T extends { id: string }>(
  array: T[],
  activeId: string,
  overId: string,
): { activeIndex: number; overIndex: number } => {
  const activeIndex = array.findIndex((item) => item.id === activeId);
  const overIndex = array.findIndex((item) => item.id === overId);

  return { activeIndex, overIndex };
};
