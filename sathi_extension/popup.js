document.addEventListener('DOMContentLoaded', function() {
    const textDiv = document.getElementById('selectedText');
    const simplytextDiv = document.getElementById('simplifiedText');
    const errorDiv = document.getElementById('error');
    const clearBtn = document.getElementById('clearBtn');
    const promptInput = document.getElementById('promptText');
    const submitBtn = document.getElementById('submitBtn');
    const outputDisplay = document.getElementById('outputDisplay');

    // Function to simplify/explain text (existing function remains the same)
    function simplify(text) {
        if (!text || text.trim() === "") {
            return "No text to simplify.";
        }

        // Replace complex words with simpler synonyms (keeping existing replacements)
        const simpleWords = {
            "utilize": "use",
            "commence": "start",
            "terminate": "end",
            "subsequently": "later",
            "endeavor": "try",
            "approximately": "about",
            "demonstrate": "show",
            "comprehend": "understand",
            "exemplify": "illustrate",
            "facilitate": "help",
            "expeditious": "fast",
            "remuneration": "salary",
            "statutory": "legal",
            "beneficiary": "person receiving benefit",
            "subsidy": "discount given by government",
            "fiscal": "financial",
            "mandate": "official order",
            "concession": "discount or exemption",
            "provision": "rule or condition",
            "redressal": "solving complaints",
            "stakeholders": "people involved",
            "eligibility": "who can apply",
            "collateral": "security for loan",
            "waiver": "cancellation of fee or requirement",
            "empowerment": "giving more power or rights",
            "procurement": "buying",
            "compliance": "following the rules",
            "grievance": "complaint",
            "levy": "tax or charge",
            "exemption": "not required to follow",
            "public sector undertaking (PSU)": "government-owned company",
            "financial inclusion": "making banking available to all",
            "corporate social responsibility (CSR)": "company's duty to help society",
            "microfinance": "small loans for poor people",
            "disbursement": "giving out money",
            "underprivileged": "poor people",
            "policy": "plan",
            "scheme": "government plan",
            "deprived": "lacking basic needs",
            "tribal": "indigenous communities",
            "upliftment": "helping people improve their lives",
            "violation": "breaking a rule",
            "jurisdiction": "legal authority over an area",
            "arbitration": "legal way to solve disputes",
            "terms and conditions": "rules you must follow",
            "liable": "responsible",
            "indemnity": "protection against loss",
            "third party": "someone else involved",
            "force majeure": "unexpected disaster (like war, flood, etc.)"
        };

        let simplifiedText = text.split(/\b/).map(word => {
            return simpleWords[word.toLowerCase()] || word;
        }).join("");

        // Additional simplifications (keeping existing replacements)
        simplifiedText = simplifiedText.replace(/\bi\.e\.\b/g, "that is");
        // ... (keep all existing replacements)

        return simplifiedText;
    }

    // Function to generate response based on query and context
    async function generateResponse(query, context) {
        query = query.toLowerCase();
        context = context.toLowerCase();
        
        outputDisplay.innerHTML = '<span class="loading">Analyzing your question...</span>';
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Preprocess the context
        const sentences = context.split('.')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        const paragraphs = context.split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        
        // Advanced response generation logic
        let response = "";
        
        // Helper function to find most relevant sentences
        const findRelevantSentences = (keywords, maxResults = 2) => {
            return sentences
                .map(sentence => ({
                    text: sentence,
                    relevance: keywords.reduce((count, word) => 
                        count + (sentence.includes(word) ? 1 : 0), 0)
                }))
                .filter(item => item.relevance > 0)
                .sort((a, b) => b.relevance - a.relevance)
                .slice(0, maxResults)
                .map(item => item.text);
        };
    
        // Helper function for extracting key phrases
        const extractKeyPhrases = (text) => {
            const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
            return text.split(' ')
                .filter(word => word.length > 2 && !commonWords.has(word));
        };
    
        // 1. Definition or explanation queries
        if (query.includes("what is") || query.includes("what are") || query.includes("define") || query.includes("explain") || query.includes("describe")) {
            const topic = query.split(/is|are|define|explain|describe/)[1].trim();
            const keywords = extractKeyPhrases(topic);
            const relevantSentences = findRelevantSentences(keywords);
            
            if (relevantSentences.length > 0) {
                response = `Here's the explanation from the text: ${relevantSentences.join(' ')}`;
            }
        }
        
        // 2. Process or method queries
        else if (query.includes("how to") || query.includes("how do") || query.includes("how does") || query.includes("process of") || query.includes("steps")) {
            const processKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s => 
                processKeywords.some(word => s.includes(word)) &&
                (s.includes("first") || s.includes("then") || s.includes("next") || 
                 s.includes("finally") || s.includes("step") || s.includes("process"))
            );
            
            if (relevantParts.length > 0) {
                response = `Here's the process described in the text: ${relevantParts.join(' ')}`;
            }
        }
        
        // 3. Reason or causation queries
        else if (query.includes("why") || query.includes("reason") || query.includes("cause") || query.includes("because")) {
            const reasonKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s =>
                reasonKeywords.some(word => s.includes(word)) &&
                (s.includes("because") || s.includes("reason") || s.includes("due to") || 
                 s.includes("result") || s.includes("therefore") || s.includes("hence"))
            );
            
            if (relevantParts.length > 0) {
                response = `Here's the explanation of why: ${relevantParts.join(' ')}`;
            }
        }
        
        // 4. Comparison queries
        else if (query.includes("compare") || query.includes("difference") || query.includes("versus") || query.includes("vs") || query.includes("better")) {
            const comparisonKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s =>
                comparisonKeywords.some(word => s.includes(word)) &&
                (s.includes("while") || s.includes("whereas") || s.includes("unlike") || 
                 s.includes("compared") || s.includes("however") || s.includes("but"))
            );
            
            if (relevantParts.length > 0) {
                response = `Here's the comparison from the text: ${relevantParts.join(' ')}`;
            }
        }
        
        // 5. Time-based queries
        else if (query.includes("when") || query.includes("time") || query.includes("duration") || query.includes("long")) {
            const timeKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s =>
                timeKeywords.some(word => s.includes(word)) &&
                (s.includes("during") || s.includes("when") || s.includes("after") || 
                 s.includes("before") || s.includes("while") || s.includes("until"))
            );
            
            if (relevantParts.length > 0) {
                response = `Here's the timing information: ${relevantParts.join(' ')}`;
            }
        }
        
        // 6. Location or place queries
        else if (query.includes("where") || query.includes("location") || query.includes("place")) {
            const locationKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s =>
                locationKeywords.some(word => s.includes(word)) &&
                (s.includes("at") || s.includes("in") || s.includes("on") || 
                 s.includes("near") || s.includes("located"))
            );
            
            if (relevantParts.length > 0) {
                response = `Here's the location information: ${relevantParts.join(' ')}`;
            }
        }
        
        // 7. List or enumeration queries
        else if (query.includes("list") || query.includes("what are the") || query.includes("types of") || query.includes("examples")) {
            const listKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s =>
                listKeywords.some(word => s.includes(word)) &&
                (s.includes("includes") || s.includes("such as") || s.includes("like") || 
                 s.includes("following") || s.includes("these") || s.includes("example"))
            );
            
            if (relevantParts.length > 0) {
                response = `Here are the relevant items: ${relevantParts.join(' ')}`;
            }
        }
        
        // 8. Quantity or measurement queries
        else if (query.includes("how many") || query.includes("how much") || query.includes("quantity") || query.includes("number of")) {
            const quantityKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s => {
                const hasNumber = /\d+/.test(s);
                return hasNumber && quantityKeywords.some(word => s.includes(word));
            });
            
            if (relevantParts.length > 0) {
                response = `Here's the quantitative information: ${relevantParts.join(' ')}`;
            }
        }
        
        // 9. Summary requests
        else if (query.includes("summarize") || query.includes("summary") || query.includes("brief") || query.includes("overview")) {
            const mainPoints = sentences
                .filter(s => 
                    s.includes("important") || s.includes("main") || s.includes("key") ||
                    s.includes("significant") || s.includes("primary") || s.includes("essential")
                )
                .slice(0, 3);
                
            if (mainPoints.length > 0) {
                response = `Key points from the text: ${mainPoints.join(' ')}`;
            } else {
                // If no obvious main points, take first and last sentences
                response = `Summary: ${sentences[0]} ... ${sentences[sentences.length - 1]}`;
            }
        }
        
        // 10. Requirement or condition queries
        else if (query.includes("required") || query.includes("need to") || query.includes("must") || query.includes("should")) {
            const requirementKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s =>
                requirementKeywords.some(word => s.includes(word)) &&
                (s.includes("must") || s.includes("should") || s.includes("need") || 
                 s.includes("require") || s.includes("necessary") || s.includes("mandatory"))
            );
            
            if (relevantParts.length > 0) {
                response = `Here are the requirements: ${relevantParts.join(' ')}`;
            }
        }
        
        // 11. Purpose or goal queries
        else if (query.includes("purpose") || query.includes("goal") || query.includes("aim") || query.includes("objective")) {
            const purposeKeywords = extractKeyPhrases(query);
            const relevantParts = sentences.filter(s =>
                purposeKeywords.some(word => s.includes(word)) &&
                (s.includes("purpose") || s.includes("goal") || s.includes("aim") || 
                 s.includes("order to") || s.includes("designed to") || s.includes("intended"))
            );
            
            if (relevantParts.length > 0) {
                response = `Here's the purpose: ${relevantParts.join(' ')}`;
            }
        }
        
        // Default response using enhanced relevance matching
        if (!response) {
            const queryKeywords = extractKeyPhrases(query);
            const relevantSentences = findRelevantSentences(queryKeywords, 3);
            
            if (relevantSentences.length > 0) {
                response = `Based on your query, here's the relevant information: ${relevantSentences.join(' ')}`;
            } else {
                response = "I couldn't find specific information about that in the selected text. Could you rephrase your question or select more relevant text?";
            }
        }
        
        return response.trim();
    }
    // Function to update the display
    function updateDisplay() {
        chrome.storage.local.get(['selectedText', 'timestamp'], function(result) {
            if (chrome.runtime.lastError) {
                errorDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
                return;
            }
            
            if (result.selectedText) {
                textDiv.textContent = result.selectedText;
                simplytextDiv.textContent = simplify(result.selectedText);
            } else {
                textDiv.textContent = 'No text selected';
                simplytextDiv.textContent = 'No text selected';
            }
        });
    }
    
    // Update display when popup opens
    updateDisplay();
    
    // Clear button handler
    clearBtn.addEventListener('click', function() {
        chrome.storage.local.clear(function() {
            textDiv.textContent = 'No text selected';
            simplytextDiv.textContent = 'No text selected';
            outputDisplay.textContent = 'Response will appear here...';
            promptInput.value = '';
        });
    });

    // Submit button handler
    submitBtn.addEventListener('click', async function() {
        const query = promptInput.value.trim();
        const selectedText = textDiv.textContent;
        
        if (!query) {
            outputDisplay.textContent = 'Please enter a question.';
            return;
        }
        
        if (selectedText === 'No text selected') {
            outputDisplay.textContent = 'Please select some text first.';
            return;
        }
        
        const response = await generateResponse(query, selectedText);
        outputDisplay.textContent = response;
    });

    // Enter key handler for prompt input
    promptInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
});