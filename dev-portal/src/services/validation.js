export function validateEmail(val) {
  const atSymbolIndex = val.indexOf('@');
  const dotSymbolIndex = val.lastIndexOf('.');

  let  errorMessage  = '';
  let isValid =true;

  if (val.length < 5) {
    isValid = false;
    errorMessage =  'Email address invalid.';
  } else if (val.length > 255) {
    isValid = false;
    errorMessage =  'Email address too long.';
  } else if (atSymbolIndex === -1 || val.lastIndexOf('@') !== atSymbolIndex) {
    isValid = false;
    errorMessage = '@-symbol placement invalid.';
  } else if (dotSymbolIndex === -1 || atSymbolIndex > dotSymbolIndex) {
    isValid = false;
    errorMessage = 'Domain dot (.) placement invalid.';
  }
  return {isValid, errorMessage, val}
}


export function validateNonEmpty(key , val) {
  let  errorMessage  = '';
  let isValid = true;

  if (val.length === 0) {
    isValid = false;
    errorMessage = key + ' may not be empty';
  } else if (val.length > 254) {
    isValid = false;
    errorMessage = key + ' is too long';
  }
  return {isValid, errorMessage, val};
}

export function validatePassword(val) {
  let errorMessage = '';
  let isValid = true;

  if (val.length < 8) {
    isValid = false;
    errorMessage = 'Password must contain at least 8 characters.';
  }
  return {isValid, errorMessage, val};

}

export function validateConfirmPassword(password, val) {
  let isValid = true;
  let errorMessage = '';
  if(password !== val)
  {
    isValid = false;
    errorMessage = 'Confirmed password does not match the password provided';
  }
  return {isValid, errorMessage, val};
}

export function validateApiClient(val) {
  let errorMessage = '';
  let isValid = true;
  if (!/^[0-9a-zA-Z_-]{0,254}$/.test(val)) {
    isValid = false;
    errorMessage = 'API client should contain only alphanumeric characters, dashes or underscores.'
  }
  return {isValid, errorMessage, val};
}
