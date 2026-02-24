// Contact utility functions
export const getContactFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim()
}

export const getContactInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
