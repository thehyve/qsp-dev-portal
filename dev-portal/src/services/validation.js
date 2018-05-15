export function validateEmail(email) {
  const atSymbolIndex = email.indexOf('@');
  const dotSymbolIndex = email.lastIndexOf('.');

  let  errorMessage  = '';
  let isValid =true;

  if (email.length < 5) {
    isValid = false;
    errorMessage =  'Email address invalid.';
  } else if (email.length > 255) {
    isValid = false;
    errorMessage =  'Email address too long.';
  } else if (atSymbolIndex === -1 || email.lastIndexOf('@') !== atSymbolIndex) {
    isValid = false;
    errorMessage = '@-symbol placement invalid.';
  } else if (dotSymbolIndex === -1 || atSymbolIndex > dotSymbolIndex) {
    isValid = false;
    errorMessage = 'Domain dot (.) placement invalid.';
  }
  return { isValid, errorMessage, email}
}


export function validateNonEmpty(key , val) {
  let  errorMessage  = '';
  let isValid =true;

  if (val.length === 0) {
    isValid = false;
    errorMessage = key + ' may not be empty';
  } else if (val.length > 254) {
    isValid = false;
    errorMessage = key + ' is too long';
  }
  return {isValid, errorMessage , val};
}