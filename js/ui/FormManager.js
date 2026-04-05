/**
 * Управление формой
 * ООО "Волга-Днепр Инжиниринг"
 */

class FormManager {
  constructor(apiClient, rateLimiter, validator) {
    this.apiClient = apiClient;
    this.rateLimiter = rateLimiter;
    this.validator = validator;
    this.currentFile = null;
  }

  init() {
    UI.modalManager.register('form', {
      overlayId: 'modalOverlay',
      onOpen: () => this._resetForm(),
      onClose: () => this._resetForm()
    });
    
    this._initFileUpload();
    this._initPhoneMask();
    this._initFormSubmit();
    this._initFloatingButton();
  }

  _initFileUpload() {
    const fileInput = Utils.DOM.getElement('fileAttachment');
    const fileDrop = Utils.DOM.getElement('fileDrop');
    
    if (!fileInput || !fileDrop) return;
    
    fileInput.addEventListener('change', (e) => this._handleFileSelect(e.target.files));
    
    fileDrop.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDrop.style.borderColor = 'var(--vd-blue)';
      fileDrop.style.background = 'rgba(0, 51, 160, 0.05)';
    });
    
    fileDrop.addEventListener('dragleave', () => {
      fileDrop.style.borderColor = '';
      fileDrop.style.background = '';
    });
    
    fileDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDrop.style.borderColor = '';
      fileDrop.style.background = '';
      this._handleFileSelect(e.dataTransfer.files);
    });
  }

  _handleFileSelect(files) {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validation = this.validator.file(file);
    
    if (!validation.valid) {
      alert(validation.error);
      const fileInput = Utils.DOM.getElement('fileAttachment');
      if (fileInput) fileInput.value = '';
      return;
    }
    
    this.currentFile = file;
    const fileNameText = Utils.DOM.getElement('fileNameText');
    const fileName = Utils.DOM.getElement('fileName');
    const fileDrop = Utils.DOM.getElement('fileDrop');
    
    if (fileNameText) fileNameText.textContent = file.name;
    if (fileName) Utils.DOM.addClass(fileName, 'show');
    if (fileDrop) Utils.DOM.addClass(fileDrop, 'has-file');
  }

  removeFile() {
    const fileInput = Utils.DOM.getElement('fileAttachment');
    const fileName = Utils.DOM.getElement('fileName');
    const fileDrop = Utils.DOM.getElement('fileDrop');
    
    this.currentFile = null;
    if (fileInput) fileInput.value = '';
    if (fileName) Utils.DOM.removeClass(fileName, 'show');
    if (fileDrop) Utils.DOM.removeClass(fileDrop, 'has-file');
  }

  _initPhoneMask() {
    const phoneInput = Utils.DOM.getElement('phone');
    if (phoneInput) {
      Utils.PhoneFormatter.bindToInput(phoneInput);
    }
  }

  _initFormSubmit() {
    const form = Utils.DOM.getElement('proposalForm');
    if (form) {
      form.addEventListener('submit', (e) => this._handleSubmit(e));
    }
    
    const removeBtn = Utils.DOM.query('#fileName svg');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeFile();
      });
    }
  }

  _initFloatingButton() {
    const btn = Utils.DOM.query('.floating-cta-btn');
    if (btn) {
      btn.addEventListener('click', () => this.openModal());
    }
  }

  openModal() {
    if (!this.rateLimiter.canProceed()) {
      const warning = Utils.DOM.getElement('rateLimitWarning');
      if (warning) Utils.DOM.addClass(warning, 'show');
      return;
    }
    
    const warning = Utils.DOM.getElement('rateLimitWarning');
    if (warning) Utils.DOM.removeClass(warning, 'show');
    
    UI.modalManager.open('form');
  }

  _validateForm() {
    const fields = [
      { id: 'companyName', validate: (v) => this.validator.required(v) && this.validator.minLength(v, 2) },
      { id: 'contactPerson', validate: (v) => this.validator.required(v) && this.validator.minLength(v, 2) },
      { id: 'email', validate: (v) => this.validator.required(v) && this.validator.email(v) },
      { id: 'phone', validate: (v) => this.validator.required(v) && this.validator.phone(v) },
      { id: 'aircraftType', validate: (v) => this.validator.required(v) },
      { id: 'serviceType', validate: (v) => this.validator.required(v) },
      { id: 'taskDescription', validate: (v) => this.validator.required(v) && this.validator.minLength(v, 10) }
    ];
    
    let isValid = true;
    
    fields.forEach(field => {
      const element = Utils.DOM.getElement(field.id);
      const errorEl = Utils.DOM.getElement(`${field.id}Error`);
      const value = element?.value?.trim() || '';
      
      if (!field.validate(value)) {
        if (element) Utils.DOM.addClass(element, 'error');
        if (errorEl) Utils.DOM.addClass(errorEl, 'show');
        isValid = false;
      } else {
        if (element) Utils.DOM.removeClass(element, 'error');
        if (errorEl) Utils.DOM.removeClass(errorEl, 'show');
      }
    });
    
    const honeypot = Utils.DOM.getElement('hp_website');
    if (honeypot && honeypot.value) {
      return false;
    }
    
    return isValid;
  }

  async _handleSubmit(e) {
    e.preventDefault();
    
    if (!this._validateForm()) return;
    
    if (!this.rateLimiter.canProceed()) {
      const warning = Utils.DOM.getElement('rateLimitWarning');
      if (warning) Utils.DOM.addClass(warning, 'show');
      return;
    }
    
    this.rateLimiter.record();
    
    const submitBtn = Utils.DOM.getElement('submitBtn');
    const originalContent = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div><span>Отправка...</span>';
    
    try {
      const formData = {
        companyName: Utils.DOM.getElement('companyName')?.value.trim() || '',
        contactPerson: Utils.DOM.getElement('contactPerson')?.value.trim() || '',
        email: Utils.DOM.getElement('email')?.value.trim() || '',
        phone: Utils.DOM.getElement('phone')?.value.trim() || '',
        aircraftType: Utils.DOM.getElement('aircraftType')?.value || '',
        serviceType: Utils.DOM.getElement('serviceType')?.value || '',
        taskDescription: Utils.DOM.getElement('taskDescription')?.value.trim() || ''
      };
      
      const result = await this.Services.apiClient.submitForm(formData);
      
      if (result.success) {
        const form = Utils.DOM.getElement('proposalForm');
        const successMessage = Utils.DOM.getElement('successMessage');
        
        if (form) form.style.display = 'none';
        if (successMessage) Utils.DOM.addClass(successMessage, 'show');
        
        setTimeout(() => {
          UI.modalManager.close('form');
        }, window.CONFIG.ANIMATION.MODAL_CLOSE_DELAY_MS);
      } else {
        alert(result.error || 'Произошла ошибка при отправке');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Произошла ошибка при отправке');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    }
  }

  get Services() {
    return window.Services || Services;
  }

  _resetForm() {
    const form = Utils.DOM.getElement('proposalForm');
    const successMessage = Utils.DOM.getElement('successMessage');
    const fileName = Utils.DOM.getElement('fileName');
    
    if (form) {
      form.reset();
      form.style.display = 'block';
    }
    
    if (successMessage) Utils.DOM.removeClass(successMessage, 'show');
    if (fileName) Utils.DOM.removeClass(fileName, 'show');
    
    Utils.DOM.queryAll('.form-input, .form-select, .form-textarea').forEach(el => {
      Utils.DOM.removeClass(el, 'error');
    });
    
    Utils.DOM.queryAll('.error-message').forEach(el => {
      Utils.DOM.removeClass(el, 'show');
    });
    
    const submitBtn = Utils.DOM.getElement('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
        <span>Отправить запрос</span>
      `;
    }
    
    this.currentFile = null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormManager;
}