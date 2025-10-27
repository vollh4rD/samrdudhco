/**
 * UPLOAD FUNCTIONALITY
 * Handles file uploads and form management
 */

class UploadManager {
    constructor() {
        this.form = document.getElementById('upload-form');
        this.fileInput = document.getElementById('file-input');
        this.descriptionInput = document.getElementById('description');
        this.clearBtn = document.getElementById('clear-btn');
        this.progressContainer = document.getElementById('upload-progress');
        this.progressBar = document.getElementById('progress-bar');
        this.resultsContainer = document.getElementById('upload-results');
        this.fileLinks = document.getElementById('file-links');
        this.errorContainer = document.getElementById('error-message');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }
        
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', this.clearForm.bind(this));
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', this.handleFileChange.bind(this));
        }
    }

    handleFileChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            console.log(`Selected ${files.length} file(s)`);
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData();
        const files = this.fileInput.files;
        const description = this.descriptionInput.value.trim();
        
        if (files.length === 0) {
            this.showError('Please select at least one file to upload.');
            return;
        }
        
        // Add files to form data
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        
        if (description) {
            formData.append('description', description);
        }
        
        this.showProgress();
        this.hideError();
        this.hideResults();
        
        try {
            // Simulate upload process (replace with actual upload endpoint)
            await this.simulateUpload(formData);
            this.showResults(files);
        } catch (error) {
            console.error('Upload failed:', error);
            this.showError('Upload failed. Please try again.');
        } finally {
            this.hideProgress();
        }
    }

    async simulateUpload(formData) {
        // This is a simulation - replace with actual upload logic
        return new Promise((resolve, reject) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(resolve, 500);
                }
                this.updateProgress(progress);
            }, 200);
        });
    }

    updateProgress(percentage) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
        }
    }

    showProgress() {
        if (this.progressContainer) {
            this.progressContainer.classList.remove('hidden');
        }
    }

    hideProgress() {
        if (this.progressContainer) {
            this.progressContainer.classList.add('hidden');
        }
    }

    showResults(files) {
        if (this.resultsContainer && this.fileLinks) {
            this.fileLinks.innerHTML = '';
            
            files.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'text-sm text-gray-300';
                fileItem.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span>${file.name}</span>
                        <span class="text-gray-500">${this.formatFileSize(file.size)}</span>
                    </div>
                `;
                this.fileLinks.appendChild(fileItem);
            });
            
            this.resultsContainer.classList.remove('hidden');
        }
    }

    hideResults() {
        if (this.resultsContainer) {
            this.resultsContainer.classList.add('hidden');
        }
    }

    showError(message) {
        if (this.errorContainer) {
            this.errorContainer.querySelector('div').textContent = message;
            this.errorContainer.classList.remove('hidden');
        }
    }

    hideError() {
        if (this.errorContainer) {
            this.errorContainer.classList.add('hidden');
        }
    }

    clearForm() {
        if (this.form) {
            this.form.reset();
        }
        this.hideProgress();
        this.hideResults();
        this.hideError();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize upload manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new UploadManager();
});