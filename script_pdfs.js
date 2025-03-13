const fs = require('fs');
const pdfParse = require('pdf-parse');

const filePath = './matematicas.pdf';
const outputJson = './preguntas_matematicas.json';

fs.readFile(filePath, async (err, data) => {
    if (err) {
        console.error('Error al leer el archivo:', err);
        return;
    }

    try {
        const pdfData = await pdfParse(data);
        const text = pdfData.text;
        const questions = [];

        // Expresión regular para capturar preguntas y respuestas
        const questionRegex = /(\d+)\.\s*(.*?)\n\s*a\)\s*(.*?)\n\s*b\)\s*(.*?)\n\s*c\)\s*(.*?)\n\s*d\)\s*(.*?)\n/gs;
        let match;
        while ((match = questionRegex.exec(text)) !== null) {
            questions.push({
                numero: parseInt(match[1]),
                pregunta: match[2].trim(),
                opciones: {
                    a: match[3].trim(),
                    b: match[4].trim(),
                    c: match[5].trim(),
                    d: match[6].trim()
                }
            });
        }

        // Extraer respuestas correctas
        const answerRegex = /(\d+)\s+([a-d])/gi;
        const answers = {};
        let answerMatch;
        while ((answerMatch = answerRegex.exec(text)) !== null) {
            answers[answerMatch[1]] = answerMatch[2];
        }

        // Asignar respuestas correctas
        questions.forEach(q => {
            q.respuesta_correcta = q.opciones[answers[q.numero]];
        });

        fs.writeFileSync(outputJson, JSON.stringify(questions, null, 2));
        console.log('Preguntas extraídas y guardadas en preguntas.json');
    } catch (error) {
        console.error('Error al procesar el PDF:', error);
    }
});
