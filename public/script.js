// This file contains all the client-side logic for the portfolio maker.

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let portfolio = {
        name: 'Your Name',
        title: 'Your Title',
        about: 'Your portfolio will be generated here. Enter a prompt in the sidebar and click "Generate Portfolio" to get started!',
        skills: [],
        projects: [],
        experience: [],
        education: [],
        contact: { email: '', linkedin: '', github: '' }
    };
    let availableThemes = {
        light: { name: 'Light', styles: { '--bg-primary': '#f3f4f6', '--bg-secondary': '#ffffff', '--text-primary': '#111827', '--text-secondary': '#374151', '--accent': '#2563eb', '--hr-color': '#2563eb', '--skill-bg': '#e5e7eb', '--skill-text': '#1f2937'}},
        dark: { name: 'Dark', styles: { '--bg-primary': '#111827', '--bg-secondary': '#1f2937', '--text-primary': '#f9fafb', '--text-secondary': '#d1d5db', '--accent': '#3b82f6', '--hr-color': '#3b82f6', '--skill-bg': '#374151', '--skill-text': '#f3f4f6'}},
        nord: { name: 'Nord', styles: { '--bg-primary': '#2e3440', '--bg-secondary': '#3b4252', '--text-primary': '#eceff4', '--text-secondary': '#d8dee9', '--accent': '#88c0d0', '--hr-color': '#88c0d0', '--skill-bg': '#4c566a', '--skill-text': '#eceff4'}},
        dracula: { name: 'Dracula', styles: { '--bg-primary': '#282a36', '--bg-secondary': '#44475a', '--text-primary': '#f8f8f2', '--text-secondary': '#bd93f9', '--accent': '#ff79c6', '--hr-color': '#ff79c6', '--skill-bg': '#6272a4', '--skill-text': '#f8f8f2'}},
        forest: { name: 'Forest', styles: { '--bg-primary': '#2d3a3a', '--bg-secondary': '#3c4d4d', '--text-primary': '#e0e0e0', '--text-secondary': '#c5c5c5', '--accent': '#a3be8c', '--hr-color': '#a3be8c', '--skill-bg': '#5d7070', '--skill-text': '#e0e0e0'}},
    };
    let currentTheme = 'light';
    let currentFont = 'inter';
    let currentLayout = 'modern';
    const fonts = {
        inter: { name: 'Inter', family: '"Inter", sans-serif' },
        roboto: { name: 'Roboto', family: '"Roboto", sans-serif' },
        lato: { name: 'Lato', family: '"Lato", sans-serif' },
        montserrat: { name: 'Montserrat', family: '"Montserrat", sans-serif' },
        'open-sans': { name: 'Open Sans', family: '"Open Sans", sans-serif' },
    };

    // --- DOM ELEMENTS ---
    const portfolioContent = document.getElementById('portfolio-content');
    const generateBtn = document.getElementById('generate-portfolio-btn');
    const aiPromptInput = document.getElementById('ai-prompt-input');
    const errorMessage = document.getElementById('error-message');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const shareBtn = document.getElementById('share-btn');
    const generateThemeBtn = document.getElementById('generate-theme-btn');
    const themePromptInput = document.getElementById('theme-prompt-input');

    // --- RENDER FUNCTIONS ---

    const renderPortfolio = () => {
        if (!portfolio) return;
        portfolioContent.innerHTML = `
            <header>
                <h1>${portfolio.name || ''}</h1>
                <p>${portfolio.title || ''}</p>
            </header>
            <div>
                <section><h2>About Me</h2><hr /><p>${portfolio.about || ''}</p></section>
                <section><h2>Skills</h2><hr /><div class="skills-container">${(portfolio.skills || []).map(skill => `<span class="skill-badge">${skill}</span>`).join('')}</div></section>
                <section>
                    <h2>Projects</h2><hr />
                    <div class="projects-container ${currentLayout}">
                        ${(portfolio.projects || []).map(p => `
                            <div class="project-item">
                                <h3>${p.name}</h3>
                                <p>${p.description}</p>
                                <a href="${p.link}" target="_blank" rel="noopener noreferrer">View Project &rarr;</a>
                            </div>`).join('')}
                    </div>
                </section>
                <section>
                    <h2>Experience</h2><hr />
                    <div>${(portfolio.experience || []).map(e => `
                        <div class="experience-item" style="margin-bottom: 2rem;">
                            <h3>${e.role}</h3>
                            <p>${e.company} (${e.duration})</p>
                            <p style="margin-top: 0.5rem;">${e.description}</p>
                        </div>`).join('')}
                    </div>
                </section>
                <section>
                    <h2>Education</h2><hr />
                    <div>${(portfolio.education || []).map(e => `
                        <div class="education-item" style="margin-bottom: 1rem;">
                            <h3>${e.institution}</h3>
                            <p>${e.degree} (${e.duration})</p>
                        </div>`).join('')}
                    </div>
                </section>
                <section style="text-align: center; padding-top: 2rem;">
                    <h2>Contact</h2><hr style="width: 25%; margin: 1rem auto;" />
                    <div class="contact-container">
                        <a href="mailto:${portfolio.contact?.email || ''}">${portfolio.contact?.email || ''}</a>
                        <a href="https://${portfolio.contact?.linkedin || ''}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href="https://${portfolio.contact?.github || ''}" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                </section>
            </div>
        `;
    };

    const renderEditor = () => {
        const editorPanel = document.getElementById('panel-edit');
        editorPanel.innerHTML = '<h2>2. Fine-Tune Details</h2>'; // Clear previous content

        for (const section in portfolio) {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'editor-section';
            
            const title = document.createElement('h3');
            title.textContent = section.charAt(0).toUpperCase() + section.slice(1);
            sectionEl.appendChild(title);

            if (Array.isArray(portfolio[section])) {
                portfolio[section].forEach((item, index) => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'editor-item';
                    if (typeof item === 'object') {
                        for (const field in item) {
                             itemEl.innerHTML += `
                                <div class="editor-item-field">
                                    <label>${field}</label>
                                    <textarea data-section="${section}" data-index="${index}" data-field="${field}" rows="${field === 'description' ? 4 : 1}">${item[field]}</textarea>
                                </div>`;
                        }
                    } else { // Array of strings (for skills)
                        itemEl.innerHTML += `
                            <div class="editor-item-field">
                                <label>Skill</label>
                                <input type="text" data-section="${section}" data-index="${index}" value="${item}" />
                            </div>`;
                    }
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remove';
                    removeBtn.className = 'editor-button remove';
                    removeBtn.onclick = () => {
                        portfolio[section].splice(index, 1);
                        renderAll();
                    };
                    itemEl.appendChild(removeBtn);
                    sectionEl.appendChild(itemEl);
                });
                const addBtn = document.createElement('button');
                addBtn.textContent = `Add ${section.slice(0, -1)}`;
                addBtn.className = 'editor-button add';
                addBtn.onclick = () => {
                     const templates = { skills: 'New Skill', projects: { name: 'New Project', description: 'Description', link: '#' }, experience: { company: 'Company', role: 'Role', duration: 'Duration', description: 'Description' }, education: { institution: 'Institution', degree: 'Degree', duration: 'Duration' } };
                     portfolio[section].push(templates[section]);
                     renderAll();
                };
                sectionEl.appendChild(addBtn);

            } else if (typeof portfolio[section] === 'object' && portfolio[section] !== null) {
                 for (const field in portfolio[section]) {
                    sectionEl.innerHTML += `
                        <div class="editor-item-field">
                            <label>${field}</label>
                            <input type="text" data-section="${section}" data-field="${field}" value="${portfolio[section][field]}" />
                        </div>`;
                 }
            } else {
                 sectionEl.innerHTML += `
                    <div class="editor-item-field">
                        <textarea data-section="${section}" rows="5">${portfolio[section]}</textarea>
                    </div>`;
            }
            editorPanel.appendChild(sectionEl);
        }
        
        // Add event listeners for the new inputs
        editorPanel.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', (e) => {
                const { section, index, field } = e.target.dataset;
                if (index !== undefined) { // Array
                    if (field) { // Array of objects
                        portfolio[section][index][field] = e.target.value;
                    } else { // Array of strings
                         portfolio[section][index] = e.target.value;
                    }
                } else if (field) { // Object
                    portfolio[section][field] = e.target.value;
                } else { // String
                    portfolio[section] = e.target.value;
                }
                renderPortfolio();
            });
        });
    };
    
    const renderCustomize = () => {
        // Render Themes
        const themeSelector = document.getElementById('theme-selector');
        themeSelector.innerHTML = '';
        for (const key in availableThemes) {
            const theme = availableThemes[key];
            const btn = document.createElement('button');
            btn.className = `customize-button theme-button ${currentTheme === key ? 'active' : ''}`;
            btn.dataset.themeKey = key;
            btn.innerHTML = `
                ${theme.name}
                <div class="color-swatches">
                    <div class="color-swatch" style="background-color: ${theme.styles['--accent']};"></div>
                    <div class="color-swatch" style="background-color: ${theme.styles['--text-secondary']};"></div>
                </div>
            `;
            btn.onclick = () => {
                currentTheme = key;
                renderAll();
            };
            themeSelector.appendChild(btn);
        }

        // Render Fonts
        const fontSelector = document.getElementById('font-selector');
        fontSelector.innerHTML = '';
        for (const key in fonts) {
            const font = fonts[key];
            const btn = document.createElement('button');
            btn.className = `customize-button ${currentFont === key ? 'active' : ''}`;
            btn.dataset.fontKey = key;
            btn.textContent = font.name;
            btn.style.fontFamily = font.family;
            btn.onclick = () => {
                currentFont = key;
                renderAll();
            };
            fontSelector.appendChild(btn);
        }

        // Render Layouts
        const layoutSelector = document.getElementById('layout-selector');
        layoutSelector.innerHTML = `
            <button class="customize-button ${currentLayout === 'modern' ? 'active' : ''}" data-layout="modern">Modern</button>
            <button class="customize-button ${currentLayout === 'classic' ? 'active' : ''}" data-layout="classic">Classic</button>
        `;
        layoutSelector.querySelectorAll('button').forEach(btn => {
            btn.onclick = () => {
                currentLayout = btn.dataset.layout;
                renderAll();
            }
        });
    };

    const renderAll = () => {
        applyThemeAndFont();
        renderPortfolio();
        renderEditor();
        renderCustomize();
    };

    // --- LOGIC & EVENT HANDLERS ---
    
    const applyThemeAndFont = () => {
        const theme = availableThemes[currentTheme].styles;
        const font = fonts[currentFont].family;
        const docStyle = document.documentElement.style;
        for (const key in theme) {
            docStyle.setProperty(key, theme[key]);
        }
        docStyle.setProperty('--font-family', font);
    };

    const setAILoading = (isLoading, type = 'portfolio') => {
        const btn = type === 'theme' ? generateThemeBtn : generateBtn;
        const textEl = document.getElementById(type === 'theme' ? 'theme-btn-text' : 'generate-btn-text');
        const iconEl = document.getElementById(type === 'theme' ? 'theme-btn-icon' : 'generate-btn-icon');
        
        btn.disabled = isLoading;
        if (isLoading) {
            textEl.textContent = 'Generating...';
            iconEl.innerHTML = '<i class="fa-solid fa-robot fa-spin"></i>';
        } else {
            textEl.textContent = type === 'theme' ? 'Create Theme' : 'Generate Portfolio';
            const iconHTML = type === 'theme' ? '<i class="fa-solid fa-palette"></i>' : '<i class="fa-solid fa-wand-magic-sparkles"></i>';
            iconEl.innerHTML = iconHTML;
        }
    };
    
    const showTabs = (isGenerated) => {
        document.querySelectorAll('#tab-edit, #tab-customize').forEach(tab => {
            tab.disabled = !isGenerated;
        });
    };

    const switchTab = (tabId) => {
        document.querySelectorAll('.sidebar-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        document.getElementById(`panel-${tabId}`).classList.add('active');
    };
    
    const callAI = async (endpoint, prompt, schema) => {
        errorMessage.textContent = '';
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, schema })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'An unknown error occurred.');
            }

            const result = await response.json();
            if (!result.candidates || result.candidates.length === 0) {
                throw new Error("No content generated by the AI.");
            }
            return JSON.parse(result.candidates[0].content.parts[0].text);
        } catch (error) {
            console.error(`AI call to ${endpoint} failed:`, error);
            errorMessage.textContent = `Error: ${error.message}`;
            return null;
        }
    };

    generateBtn.onclick = async () => {
        const promptText = aiPromptInput.value;
        if (!promptText) {
            errorMessage.textContent = 'Please provide some details.';
            return;
        }
        setAILoading(true);
        // More robust prompt to ensure all fields are returned
        const robustPrompt = `Generate a complete professional portfolio based on this input: '${promptText}'. You MUST return a JSON object that strictly follows the provided schema. For ANY fields where information is missing from the input (like 'about', 'projects', 'experience', 'education', 'contact'), you MUST create realistic and professional-sounding placeholder content. Do not omit any fields from the JSON schema.`;
        const schema = { type: "OBJECT", properties: { name: { type: "STRING" }, title: { type: "STRING" }, about: { type: "STRING" }, skills: { type: "ARRAY", items: { type: "STRING" } }, projects: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" }, link: { type: "STRING" } } } }, experience: { type: "ARRAY", items: { type: "OBJECT", properties: { company: { type: "STRING" }, role: { type: "STRING" }, duration: { type: "STRING" }, description: { type: "STRING" } } } }, education: { type: "ARRAY", items: { type: "OBJECT", properties: { institution: { type: "STRING" }, degree: { type: "STRING" }, duration: { type: "STRING" } } } }, contact: { type: "OBJECT", properties: { email: { type: "STRING" }, linkedin: { type: "STRING" }, github: { type: "STRING" } } } } };
        const result = await callAI('/generate-portfolio', robustPrompt, schema);
        setAILoading(false);
        if (result) {
            portfolio = { ...portfolio, ...result };
            renderAll();
            showTabs(true);
            switchTab('customize');
        }
    };
    
    generateThemeBtn.onclick = async () => {
        const promptText = themePromptInput.value;
        if (!promptText) {
            errorMessage.textContent = 'Please describe the theme you want.';
            return;
        }
        setAILoading(true, 'theme');
        const schema = { type: "OBJECT", properties: { themeName: { type: "STRING" }, colors: { type: "OBJECT", properties: { '--bg-primary': { type: 'STRING' }, '--bg-secondary': { type: 'STRING' }, '--text-primary': { type: 'STRING' }, '--text-secondary': { type: 'STRING' }, '--accent': { type: 'STRING' }, '--hr-color': { type: 'STRING' }, '--skill-bg': { type: 'STRING' }, '--skill-text': { type: 'STRING' } } } } };
        const result = await callAI('/generate-theme', promptText, schema);
        setAILoading(false, 'theme');
        if (result) {
            let newThemeName = result.themeName.replace(/[^a-z0-9]/gi, '').toLowerCase();
            if (!newThemeName) newThemeName = 'custom';
            if (availableThemes[newThemeName]) newThemeName = `${newThemeName}${Date.now()}`;
            
            const newTheme = { name: result.themeName, styles: result.colors };
            availableThemes[newThemeName] = newTheme;
            currentTheme = newThemeName;
            renderAll();
        }
    };

    downloadPdfBtn.onclick = async () => {
        const { jsPDF } = window.jspdf;
        const elementToCapture = document.getElementById('portfolio-content');
        const container = document.getElementById('portfolio-preview-container');
        if (!elementToCapture) return;

        container.style.overflowY = 'visible';
        container.style.height = 'auto';

        const canvas = await html2canvas(elementToCapture, { scale: 2, useCORS: true });
        
        container.style.overflowY = 'auto';
        container.style.height = '100vh';

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgData = canvas.toDataURL('image/png');
        const canvasAspectRatio = canvas.width / canvas.height;
        
        let imgWidth = pdfWidth;
        let imgHeight = pdfWidth / canvasAspectRatio;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`${portfolio.name.replace(/\s/g, '_')}_Portfolio.pdf`);
    };
    
    shareBtn.onclick = () => {
        try {
            const customThemes = Object.fromEntries(Object.entries(availableThemes).filter(([key]) => !['light', 'dark', 'nord', 'dracula', 'forest'].includes(key)));
            const data = btoa(JSON.stringify({ portfolio, theme: currentTheme, font: currentFont, layout: currentLayout, customThemes }));
            const url = `${window.location.origin}${window.location.pathname}#${data}`;
            
            navigator.clipboard.writeText(url).then(() => {
                alert('Shareable link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy link automatically: ', err);
                prompt("Could not copy automatically. Please copy this link:", url);
            });
        } catch (err) {
            console.error('Failed to generate link: ', err);
            errorMessage.textContent = 'Could not generate shareable link.';
        }
    };
    
    // --- INITIALIZATION ---
    const init = () => {
        // Setup Icons using Font Awesome
        document.getElementById('generate-btn-icon').innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i>';
        document.getElementById('theme-btn-icon').innerHTML = '<i class="fa-solid fa-palette"></i>';
        document.getElementById('share-btn').innerHTML = '<i class="fa-solid fa-share-nodes"></i>';
        document.getElementById('download-pdf-btn').innerHTML = '<i class="fa-solid fa-download"></i>';

        // Setup Tabs
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.onclick = (e) => switchTab(e.target.id.split('-')[1]);
        });
        
        // Load from URL if present
        const hash = window.location.hash.substring(1);
        if (hash) {
            try {
                const data = JSON.parse(atob(hash));
                portfolio = { ...portfolio, ...data.portfolio };
                currentTheme = data.theme;
                currentFont = data.font;
                currentLayout = data.layout;
                availableThemes = { ...availableThemes, ...data.customThemes };
                showTabs(true);
                switchTab('edit');
            } catch (error) {
                console.error("Failed to parse data from URL:", error);
            }
        }

        renderAll();
    };

    init();
});

