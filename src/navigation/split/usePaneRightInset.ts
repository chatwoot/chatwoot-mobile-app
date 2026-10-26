/**
 * Right padding content in the split view's conversation pane needs to stay clear of the status
 * bar column. It's 0: the pane is sized to end before that column (SplitView gives that width
 * to the side column instead), so its content never moves or resizes when a column opens.
 * Kept as a hook so layouts that size against it stay correct if that changes.
 */
export const usePaneRightInset = () => 0;
