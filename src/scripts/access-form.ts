for (const form of document.querySelectorAll<HTMLFormElement>('[data-access-form]')) {
  const fields = form.querySelector<HTMLFieldSetElement>('fieldset')!;
  const result = form.querySelector<HTMLElement>('.access-result')!;
  let pending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.dataset.ready !== 'true' || pending || !form.reportValidity()) return;
    const payload = Object.fromEntries(new FormData(form).entries());
    if (payload._honey) return;
    pending = true;
    fields.disabled = true;
    form.setAttribute('aria-busy', 'true');
    result.textContent = form.dataset.sending!;
    delete result.dataset.state;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/'), {
        method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(payload), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !(data.success === true || data.success === 'true')) throw new Error('Submission failed');
      form.reset();
      result.dataset.state = 'success';
      result.textContent = form.dataset.success!;
    } catch {
      result.dataset.state = 'error';
      result.textContent = form.dataset.error!;
    } finally {
      clearTimeout(timeout);
      fields.disabled = false;
      pending = false;
      form.removeAttribute('aria-busy');
      result.focus({preventScroll: true});
    }
  });
}
