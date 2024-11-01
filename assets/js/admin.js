function S3DCAdmin() {
    this.linksEnabled = false;
    // Select the form elements on the plugin page in the admin UI
    this.init = function() {
        try {
            this.form = document.querySelector('#s3dc-generator');
            this.copyButton = this.form.querySelector('#s3dc-copy-button');
            this.outputWrapper = this.form.querySelector('#s3dc-output-wrapper');
            this.output = this.form.querySelector('#s3dc-output');
            this.copyButton.addEventListener('click', this.copyShortcode.bind(this));
            this.form.querySelector('#s3dc-option-links').addEventListener('change', this.handleLinksOption.bind(this));
            [
                'input',
                'change'
            ].forEach((function(type) {
                return this.form.addEventListener(type, this.generate.bind(this));
            }).bind(this));
        } catch (error) {
            console.error('S3DC initialise error:', error);
        }
    };
    this.handleLinksOption = function(e) {
        var selectors = '.s3dc-link-wrapper, .s3dc-option-target-wrapper';
        var nodes = document.querySelectorAll(selectors);
        var checked = e.currentTarget.checked;
        nodes.forEach(function(node) {
            return node.style.display = checked ? 'block' : 'none';
        });
        this.linksEnabled = checked;
    };
    // Generate shortcode and display it in the admin UI 
    this.generate = function() {
        var shortcode = "[s3dc"; // Open shortcode string
        var selectors = this.linksEnabled ? '.s3dc-property-side, .s3dc-property-link, .s3dc-property-target' : '.s3dc-property-side';
        var formFields = this.form.querySelectorAll(selectors);
        formFields.forEach(function(node) {
            var key = node.name;
            var value = node.type === 'checkbox' ? node.checked : node.value;
            if (node.type === 'radio' && node.checked || node.type !== 'radio') {
                shortcode += " ".concat(key, "='").concat(value, "'");
            }
        });
        if (this.linksEnabled) {
            shortcode += " clickable='1'";
        }
        shortcode += "]"; // Close shortcode string
        this.outputWrapper.style.display = 'block';
        this.output.value = shortcode;
    };
    // Copy shortcode to the clipboard
    this.copyShortcode = function() {
        this.output.select();
        this.output.setSelectionRange(0, 99999);
        document.execCommand("copy");
    };
    this.init();
}
jQuery(document).ready(function() {
    return new S3DCAdmin();
});

