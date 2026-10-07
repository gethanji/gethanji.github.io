// Paste only the public opaque FormSubmit ID after recipient activation.
// Never put the destination email or an activation link in this public file.
export const accessFormId: string = '';
export const accessFormReady = /^[a-f0-9]{32}$/i.test(accessFormId);
export const accessFormEndpoint = accessFormReady ? `https://formsubmit.co/${accessFormId}` : undefined;
