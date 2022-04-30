function generateFullName (firstName: string | undefined, lastName: string | undefined): string {
  let fullName = ''
  if (firstName) fullName += firstName + ' '
  if (lastName) fullName += lastName

  return fullName.trim()
}

export default generateFullName
