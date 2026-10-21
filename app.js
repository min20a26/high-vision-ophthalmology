// Edit this object to maintain the example details for your portfolio demo.
// Replace every placeholder with verified clinic information before real use.
const PRACTICE_CONFIG = {
  name: 'High Vision Ophthalmology',
  address: 'Office address to be added',
  phoneDisplay: '(718) 555-0100',
  phoneLink: '+17185550100',
  hours: 'Sample hours: Monday–Friday · 8:30 AM–5:00 PM',
  insurancePlans: ['Aetna (example)', 'Blue Cross Blue Shield (example)', 'Cigna (example)', 'UnitedHealthcare (example)', 'Medicare (example)'],
  prices: { newPatient: '$160', followUp: '$95' },
  sampleTimes: ['9:00 AM', '10:30 AM', '1:15 PM', '3:00 PM']
};

const form = document.querySelector('#appointment-form');
const formSteps = Array.from(document.querySelectorAll('.form-step'));
const formError = document.querySelector('#form-error');
const formMessage = document.querySelector('#form-message');
let currentStep = 1;
let selectedDate = null;
let selectedTime = null;

function formatDay(date, options) {
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function nextWeekdays(count) {
  const days = [];
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  while (days.length < count) {
    if (date.getDay() !== 0 && date.getDay() !== 6) days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function updateSummary() {
  document.querySelector('#summary-date').textContent = selectedDate ? formatDay(selectedDate, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Choose a day';
  document.querySelector('#summary-time').textContent = selectedTime || 'Choose a time';
}

function renderDates() {
  const container = document.querySelector('#date-options');
  const days = nextWeekdays(7);
  container.innerHTML = '';
  days.forEach((date, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'date-option' + (index === 0 ? ' selected' : '');
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', index === 0 ? 'true' : 'false');
    button.innerHTML = '<span>' + formatDay(date, { weekday: 'short' }) + '</span><b>' + formatDay(date, { day: 'numeric' }) + '</b>';
    button.addEventListener('click', function () {
      container.querySelectorAll('.date-option').forEach(function (item) {
        item.classList.remove('selected');
        item.setAttribute('aria-checked', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-checked', 'true');
      selectedDate = date;
      document.querySelector('#chosen-day-label').textContent = formatDay(date, { weekday: 'long', month: 'short', day: 'numeric' });
      updateSummary();
    });
    container.appendChild(button);
  });
  selectedDate = days[0];
  document.querySelector('#chosen-day-label').textContent = formatDay(days[0], { weekday: 'long', month: 'short', day: 'numeric' });
  renderTimes();
}

function renderTimes() {
  const container = document.querySelector('#time-options');
  container.innerHTML = '';
  selectedTime = null;
  PRACTICE_CONFIG.sampleTimes.forEach(function (time) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-option';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    button.textContent = time;
    button.addEventListener('click', function () {
      container.querySelectorAll('.time-option').forEach(function (item) {
        item.classList.remove('selected');
        item.setAttribute('aria-checked', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-checked', 'true');
      selectedTime = time;
      updateSummary();
    });
    container.appendChild(button);
  });
  updateSummary();
}

function setStep(step) {
  currentStep = step;
  formError.hidden = true;
  formMessage.hidden = true;
  formSteps.forEach(function (section) {
    const active = Number(section.dataset.step) === step;
    section.hidden = !active;
    section.classList.toggle('active', active);
  });
  document.querySelectorAll('[data-step-dot]').forEach(function (dot) {
    const number = Number(dot.dataset.stepDot);
    dot.classList.toggle('active', number === step);
    dot.classList.toggle('complete', number < step);
  });
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function validCurrentStep() {
  if (currentStep === 1 && (!selectedDate || !selectedTime)) {
    showError('Choose a sample day and time to continue.');
    return false;
  }
  if (currentStep === 2) {
    const required = ['firstName', 'lastName', 'dob', 'phone'];
    for (const name of required) {
      const field = form.elements.namedItem(name);
      if (!field.value.trim()) {
        field.focus();
        showError('Please complete your name, date of birth, and phone fields using sample information.');
        return false;
      }
    }
    if (form.elements.paymentType.value === 'insurance' && !form.elements.insurancePlan.value) {
      form.elements.insurancePlan.focus();
      showError('Choose one of the example insurance plans, or select self-pay.');
      return false;
    }
  }
  return true;
}

document.querySelectorAll('.next-step').forEach(function (button) {
  button.addEventListener('click', function () {
    if (validCurrentStep()) setStep(Math.min(currentStep + 1, 3));
  });
});
document.querySelectorAll('.previous-step').forEach(function (button) {
  button.addEventListener('click', function () { setStep(Math.max(currentStep - 1, 1)); });
});

function updatePaymentFields() {
  const usingInsurance = form.elements.paymentType.value === 'insurance';
  document.querySelector('#insurance-fields').hidden = !usingInsurance;
  document.querySelector('#selfpay-fields').hidden = usingInsurance;
  form.elements.insurancePlan.required = usingInsurance;
}
form.querySelectorAll('input[name="paymentType"]').forEach(function (input) {
  input.addEventListener('change', updatePaymentFields);
});

function syncConditional(radioName, expected, targetSelector) {
  const selected = form.querySelector('input[name="' + radioName + '"]:checked');
  document.querySelector(targetSelector).hidden = !selected || selected.value !== expected;
}
form.querySelectorAll('input[name="visitReason"]').forEach(function (input) {
  input.addEventListener('change', function () { syncConditional('visitReason', 'Other', '#reason-detail-wrap'); });
});
form.querySelectorAll('input[name="symptoms"]').forEach(function (input) {
  input.addEventListener('change', function () {
    const painChecked = Boolean(form.querySelector('input[name="symptoms"][value="Pain"]:checked'));
    document.querySelector('#pain-severity-wrap').hidden = !painChecked;
  });
});
form.querySelectorAll('input[name="surgery"]').forEach(function (input) {
  input.addEventListener('change', function () { syncConditional('surgery', 'Yes', '#surgery-details'); });
});
form.querySelectorAll('input[name="priorVisit"]').forEach(function (input) {
  input.addEventListener('change', function () { syncConditional('priorVisit', 'Yes', '#prior-visit-details'); });
});

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (!validCurrentStep()) return;
  // Deliberately do not serialize, log, transmit, or store patient-like input.
  formMessage.textContent = 'Demo complete. No appointment was booked, and no information was sent or saved. In a real clinic, contact the office directly to confirm availability and insurance details.';
  formMessage.hidden = false;
  formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function setText(selector, value) {
  document.querySelector(selector).textContent = value;
}

function renderConfig() {
  const select = document.querySelector('#insurance-select');
  select.innerHTML = '<option value="">Choose an example plan</option>';
  PRACTICE_CONFIG.insurancePlans.forEach(function (plan) {
    const option = document.createElement('option');
    option.value = plan;
    option.textContent = plan;
    select.appendChild(option);
  });
  const list = document.querySelector('#insurance-list');
  list.innerHTML = '';
  PRACTICE_CONFIG.insurancePlans.forEach(function (plan) {
    const item = document.createElement('li');
    item.textContent = plan;
    list.appendChild(item);
  });
  setText('#new-patient-price', PRACTICE_CONFIG.prices.newPatient);
  setText('#followup-price', PRACTICE_CONFIG.prices.followUp);
  setText('#display-new-price', PRACTICE_CONFIG.prices.newPatient);
  setText('#display-followup-price', PRACTICE_CONFIG.prices.followUp);
  setText('#office-address', PRACTICE_CONFIG.address);
  setText('#office-hours', PRACTICE_CONFIG.hours);
  setText('#phone-link', PRACTICE_CONFIG.phoneDisplay);
  setText('#office-phone', PRACTICE_CONFIG.phoneDisplay);
  document.querySelector('#phone-link').href = 'tel:' + PRACTICE_CONFIG.phoneLink;
  document.querySelector('#office-phone').href = 'tel:' + PRACTICE_CONFIG.phoneLink;
  document.querySelector('#year').textContent = String(new Date().getFullYear());
  document.title = PRACTICE_CONFIG.name + ' | See what’s possible';
}

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
menuToggle.addEventListener('click', function () {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
nav.querySelectorAll('a').forEach(function (link) {
  link.addEventListener('click', function () {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  });
});

renderConfig();
renderDates();
updatePaymentFields();
