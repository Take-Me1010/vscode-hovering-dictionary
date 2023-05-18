//@ts-check

(function () {
    /**
     * @typedef LookupResult
     * @property {string} head
     * @property {string} description
     * 
     * @typedef {import('../src/uix/explorer').MessagePayload} MessagePayload
     * @typedef {import('vscode-webview').WebviewApi<LookupResult[]>} WebviewApi
    */

    /**
     * @type WebviewApi
     */
    const vscode = acquireVsCodeApi();

    const container = document.getElementById('container');

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        /**@type MessagePayload */
        const payload = event.data; // The json data that the extension sent
        switch (payload.type) {
            case 'POST':
                {
                    if (container) { createResult(container, payload.body); }
                    break;
                }
            case 'DELETE':
                {
                    if (container) { clearResult(container); }
                    break;
                }
        }
    });

    /**
     * 
     * @param {string} head 
     */
    function createHeadElement(head) {
        const href = 'https://eow.alc.co.jp/search?q=' + head.trim().replaceAll(' ', '+');
        const headElement = document.createElement('h1');
        headElement.className = 'head';
        headElement.innerHTML = /* html */`<a href="${href}">${head}</a>`;
        return headElement;
    }
    /**
     * 
     * @param {string} description 
     */
    function createDescriptionElement(description) {
        const rules = [
            {
                search: "(■.+|◆.+)",
                replace: /* html */ `<span class="group">$1</span>`,
            },
            {
                search: "({.+?}|\\[.+?\\]|\\(.+?\\))",
                replace: /* html */ `<span class="group">$1</span>`,
            },
            {
                search: "(【.+?】|《.+?》|〈.+?〉|〔.+?〕)",
                replace: /* html */ `<span class="group">$1</span>`,
            },
            {
                search: "\\n|\\\\n",
                replace: /* html */ `<br/>`,
            },
        ];
        const descElement = document.createElement('p');
        let styledDescription = description;
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            styledDescription = styledDescription.replaceAll(new RegExp(rule.search, 'g'), rule.replace);
        }
        descElement.innerHTML = styledDescription;
        return descElement;
    }

    /**
     * 
     * @param {HTMLElement} container 
     * @param {LookupResult[]} entries 
     */
    function createResult(container, entries) {
        clearResult(container);
        for (let i = 0; i < entries.length; i++) {
            const { head, description } = entries[i];
            const entrySection = document.createElement('section');
            entrySection.className = 'entry';
            const headElement = createHeadElement(head);
            const descElement = createDescriptionElement(description);
            entrySection.appendChild(headElement);
            entrySection.appendChild(descElement);
            container.appendChild(entrySection);
        }
    }
    /**
     * 
     * @param {HTMLElement} container 
     */
    function clearResult(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
}());
