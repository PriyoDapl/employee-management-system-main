/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a due date relative to today
 * @param {string|Date} dueDate - The due date to format
 * @returns {string} - Formatted string like "Due today", "Due tomorrow", etc.,.
 */
export const formatDueDate = (dueDate) => {
  if (!dueDate) return "No due date";
  
  const dueDateTime = new Date(dueDate);
  const now = new Date();
  
  // Compare only the date parts, and leaving the time part out for the time zone issues
  const dueDateOnly = new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dueDateOnly - todayOnly;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Converting milliseconds to days
  
  // The negative value will indicate overdue tasks and also the number of days overdue
  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day(s)`;
  } else if (diffDays === 0) {
    return "Due today";
  } else if (diffDays === 1) {
    return "Due tomorrow";
  } else {
    return `Due in ${diffDays} day(s)`;
  }
};

/**
 * Checks if a task is overdue
 * @param {string|Date} dueDate - The due date to check
 * @returns {boolean} - True if the task is overdue
 */
export const isTaskOverdue = (dueDate) => {
  if (!dueDate) return false;
  
  const dueDateTime = new Date(dueDate);
  const now = new Date();
  
  // Compare only the date parts, not time
  const dueDateOnly = new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return dueDateOnly < todayOnly;
};
