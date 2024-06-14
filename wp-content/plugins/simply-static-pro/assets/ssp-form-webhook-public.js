'use strict';

// Get options from JSON file.
let form_config_element = document.querySelector("meta[name='ssp-config-path']");

if (null !== form_config_element) {
    let config_path = form_config_element.getAttribute("content");
    let config_url = window.location.origin + config_path + 'forms.json';
    let forms;

    function loadForms(callback) {
        let xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', config_url, false);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    loadForms(function (response) {
        let json = JSON.parse(response);
        forms = json;
    });


    function success(el, redirect_url) {
        el.target.submit.disabled = false;

        if (el.target.querySelector('input[type="submit"]')) {
            el.target.querySelector('input[type="submit"]').blur();
        }

        el.target.reset();

        // Redirect if set
        if (redirect_url.length > 0) {
            window.location.replace(redirect_url);
        }
    }

    function submitForm(method, url, redirect_url, data, el) {
        let xhr = new XMLHttpRequest();

        xhr.open(method, url);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;

            if (xhr.status === 200) {
                success(el, redirect_url);
            }
        };

        xhr.send(data);
    }

    function modifyFormAttributes(form) {
        form.removeAttribute("action");
        form.removeAttribute("method");
        form.removeAttribute("enctype");
        form.removeAttribute("novalidate");
    }

    document.addEventListener("DOMContentLoaded", function () {
        const allForms = document.querySelectorAll(
            ".wpcf7 form, .wpcf7-form, .gform_wrapper form, .wpforms-container form, .elementor-form"
        );

        allForms.forEach((form) => {
            modifyFormAttributes(form);

            // Inputs
            const inputs = form.querySelectorAll("input");

            // Add HTML required attribute
            inputs.forEach((input) => {
                if (input.getAttribute("aria-required") === "true") {
                    input.required = true;
                }
            });

            form.addEventListener("submit", function (el) {
                el.preventDefault();

                let form_id;

                // Check if its Contact Form 7.
                if (form.className.includes('wpcf7-form')) {
                    // Get the current form id.
                    form_id = form.parentNode.id;
                } else if (form.parentNode.className.includes('gform_wrapper')) {
                    // Get the current form id.
                    let form_id_data = form.id.split('_');
                    form_id = form_id_data[1];
                } else if (form.className.includes('elementor-form')) {
                    form_id = form.querySelector("[name='form_id']").value;
                }

                // Get form settings based on id.
                let settings = forms.find(x => x.id == form_id);

                if (settings) {
                    let data = new FormData(form);
                    submitForm("POST", settings.endpoint, settings.redirect_url, data, el);
                }
            });
        });
    });
}



