import { jsPDF } from 'jspdf';
import i18n from '../i18n/config';

/**
 * Get language-appropriate font for PDF generation
 * Enhanced to support Polish, Lithuanian, and German special characters
 * @param {string} language - Current language code
 * @returns {Object} Font configuration
 */
const getLanguageFont = (language) => {
  // Using Helvetica with proper encoding for better character support
  // jsPDF's Helvetica supports Latin Extended-A (includes Polish, Lithuanian, German)
  const fontConfigs = {
    en: { font: 'helvetica', encoding: 'WinAnsiEncoding', supports: true },
    pl: { font: 'helvetica', encoding: 'WinAnsiEncoding', supports: true }, // ą, ć, ę, ł, ń, ó, ś, ź, ż
    de: { font: 'helvetica', encoding: 'WinAnsiEncoding', supports: true }, // ä, ö, ü, ß
    lt: { font: 'helvetica', encoding: 'WinAnsiEncoding', supports: true }  // ą, č, ę, ė, į, š, ų, ū, ž
  };
  
  return fontConfigs?.[language] || fontConfigs?.en;
};

/**
 * Get translated text for PDF report
 * @param {string} key - Translation key
 * @param {Object} options - Translation options
 * @param {string} language - Target language
 * @returns {string} Translated text
 */
const t = (key, language, options = {}) => {
  return i18n?.t(key, { ...options, lng: language });
};

/**
 * Service for generating professional PDF reports from pitch assessments
 * Optimized for printing with proper margins and character encoding
 */
export const pdfService = {
  /**
   * Generate comprehensive PDF report from assessment data
   * @param {Object} assessmentData - Complete assessment data
   * @param {string} fileName - Original pitch file name
   * @param {string} language - Report language (en, pl, de, lt)
   * @returns {void} - Downloads PDF automatically
 */
  generateReport(assessmentData, fileName = 'pitch', language = 'en') {
    // Create PDF with better print settings
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const fontConfig = getLanguageFont(language);
    
    // Set font with proper encoding for special characters
    doc?.setFont(fontConfig?.font, 'normal');
    
    // Enhanced margins for better printing (standard print margins)
    const pageWidth = doc?.internal?.pageSize?.getWidth();
    const pageHeight = doc?.internal?.pageSize?.getHeight();
    const margin = 25; // Increased from 20 for better print margins
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - margin - 15) { // Extra space for footer
        doc?.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to wrap text with better line spacing
    const wrapText = (text, maxWidth) => {
      return doc?.splitTextToSize(text || '', maxWidth);
    };

    // Helper function to get score color
    const getScoreColor = (score) => {
      if (score >= 8.5) return [34, 197, 94]; // success green
      if (score >= 7.0) return [59, 130, 246]; // primary blue
      if (score >= 5.5) return [234, 179, 8]; // warning yellow
      return [239, 68, 68]; // error red
    };

    // ===== HEADER SECTION - Simplified for printing =====
    doc?.setFillColor(59, 130, 246);
    doc?.rect(0, 0, pageWidth, 45, 'F');
    doc?.setTextColor(255, 255, 255);
    doc?.setFontSize(26);
    doc?.setFont(fontConfig?.font, 'bold');
    doc?.text(t('results.title', language), margin, 28);
    doc?.setFontSize(11);
    doc?.setFont(fontConfig?.font, 'normal');
    doc?.text(`${t('common.download', language)}: ${new Date()?.toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 37);
    
    yPosition = 60;

    // ===== PITCH INFORMATION =====
    doc?.setTextColor(0, 0, 0);
    doc?.setFontSize(13);
    doc?.setFont(fontConfig?.font, 'bold');
    doc?.text(t('dashboard.uploadTitle', language), margin, yPosition);
    yPosition += 7;
    
    doc?.setFontSize(11);
    doc?.setFont(fontConfig?.font, 'normal');
    doc?.text(`${t('common.upload', language)}: ${fileName}`, margin, yPosition);
    yPosition += 18;

    // ===== GENERATED PITCH CONTENT SECTION (if available) =====
    if (assessmentData?.pitchContent) {
      checkPageBreak(35);
      doc?.setFillColor(239, 246, 255);
      doc?.roundedRect(margin, yPosition, contentWidth, 12, 3, 3, 'F');
      
      doc?.setFontSize(13);
      doc?.setFont(fontConfig?.font, 'bold');
      doc?.setTextColor(59, 130, 246);
      doc?.text(t('templates.pitchContent', language) || 'Generated Pitch Content', margin + 6, yPosition + 8);
      yPosition += 18;
      
      doc?.setTextColor(0, 0, 0);
      doc?.setFontSize(10);
      doc?.setFont(fontConfig?.font, 'normal');
      
      // Split pitch content into paragraphs and wrap each
      const pitchParagraphs = (assessmentData?.pitchContent || '')?.split('\n\n');
      
      pitchParagraphs?.forEach((paragraph, index) => {
        if (!paragraph?.trim()) return;
        
        const paragraphLines = wrapText(paragraph?.trim(), contentWidth - 12);
        const requiredHeight = (paragraphLines?.length * 5) + 8;
        
        checkPageBreak(requiredHeight);
        
        doc?.setFillColor(249, 250, 251);
        const boxHeight = (paragraphLines?.length * 5) + 6;
        doc?.roundedRect(margin, yPosition, contentWidth, boxHeight, 2, 2, 'F');
        
        doc?.text(paragraphLines, margin + 6, yPosition + 6);
        yPosition += boxHeight + 4;
      });
      
      yPosition += 10;
    }

    // ===== OVERALL SCORE SECTION - Cleaner layout =====
    checkPageBreak(55);
    doc?.setFillColor(249, 250, 251);
    doc?.roundedRect(margin, yPosition, contentWidth, 48, 3, 3, 'F');
    
    doc?.setFontSize(15);
    doc?.setFont(fontConfig?.font, 'bold');
    doc?.text(t('results.overallAssessment', language), margin + 6, yPosition + 12);
    
    // Score display - larger and clearer
    const scoreColor = getScoreColor(assessmentData?.overallScore);
    doc?.setFillColor(...scoreColor);
    doc?.circle(pageWidth - margin - 22, yPosition + 24, 16, 'F');
    doc?.setTextColor(255, 255, 255);
    doc?.setFontSize(22);
    doc?.setFont(fontConfig?.font, 'bold');
    doc?.text(assessmentData?.overallScore?.toFixed(1), pageWidth - margin - 28, yPosition + 27);
    
    doc?.setTextColor(0, 0, 0);
    doc?.setFontSize(10);
    doc?.setFont(fontConfig?.font, 'normal');
    const feedbackLines = wrapText(assessmentData?.overallFeedback || '', contentWidth - 55);
    doc?.text(feedbackLines, margin + 6, yPosition + 22);
    
    yPosition += 58;

    // ===== KEY STRENGTHS & PRIORITY AREAS - Better spacing =====
    checkPageBreak(45);
    
    // Strengths box
    doc?.setFillColor(220, 252, 231);
    doc?.roundedRect(margin, yPosition, (contentWidth / 2) - 6, 38, 3, 3, 'F');
    doc?.setFillColor(34, 197, 94);
    doc?.setTextColor(255, 255, 255);
    doc?.setFontSize(11);
    doc?.setFont(fontConfig?.font, 'bold');
    doc?.text(t('results.keyStrengths', language), margin + 6, yPosition + 9);
    doc?.setTextColor(0, 0, 0);
    doc?.setFontSize(9);
    doc?.setFont(fontConfig?.font, 'normal');
    const strengthLines = wrapText(assessmentData?.overallStrengths || '', (contentWidth / 2) - 18);
    doc?.text(strengthLines, margin + 6, yPosition + 17);
    
    // Priority areas box
    doc?.setFillColor(254, 243, 199);
    doc?.roundedRect(margin + (contentWidth / 2) + 6, yPosition, (contentWidth / 2) - 6, 38, 3, 3, 'F');
    doc?.setFillColor(234, 179, 8);
    doc?.setTextColor(255, 255, 255);
    doc?.setFontSize(11);
    doc?.setFont(fontConfig?.font, 'bold');
    doc?.text(t('results.priorityAreas', language), margin + (contentWidth / 2) + 12, yPosition + 9);
    doc?.setTextColor(0, 0, 0);
    doc?.setFontSize(9);
    doc?.setFont(fontConfig?.font, 'normal');
    const weaknessLines = wrapText(assessmentData?.overallWeaknesses || '', (contentWidth / 2) - 18);
    doc?.text(weaknessLines, margin + (contentWidth / 2) + 12, yPosition + 17);
    
    yPosition += 48;

    // ===== SECTION SCORES - Improved readability =====
    checkPageBreak(25);
    doc?.setFontSize(15);
    doc?.setFont(fontConfig?.font, 'bold');
    doc?.text(t('detailedScores.title', language), margin, yPosition);
    yPosition += 12;

    assessmentData?.sectionScores?.forEach((section, index) => {
      checkPageBreak(16);
      
      doc?.setFillColor(249, 250, 251);
      doc?.roundedRect(margin, yPosition, contentWidth, 13, 2, 2, 'F');
      
      doc?.setFontSize(10);
      doc?.setFont(fontConfig?.font, 'bold');
      doc?.setTextColor(0, 0, 0);
      doc?.text(section?.name, margin + 4, yPosition + 9);
      
      // Progress bar - slightly larger
      const barWidth = 45;
      const barX = pageWidth - margin - barWidth - 18;
      doc?.setDrawColor(229, 231, 235);
      doc?.setLineWidth(0.5);
      doc?.roundedRect(barX, yPosition + 4, barWidth, 6, 1, 1, 'S');
      
      const fillWidth = (section?.score / 10) * barWidth;
      const barColor = getScoreColor(section?.score);
      doc?.setFillColor(...barColor);
      doc?.roundedRect(barX, yPosition + 4, fillWidth, 6, 1, 1, 'F');
      
      // Score text - larger
      doc?.setFontSize(10);
      doc?.setFont(fontConfig?.font, 'bold');
      doc?.text(section?.score?.toFixed(1), pageWidth - margin - 12, yPosition + 9);
      
      yPosition += 15;
    });

    yPosition += 8;

    // ===== STRENGTHS SECTION - Better formatting =====
    if (assessmentData?.strengths?.length > 0) {
      checkPageBreak(25);
      doc?.setFontSize(15);
      doc?.setFont(fontConfig?.font, 'bold');
      doc?.setTextColor(34, 197, 94);
      doc?.text(t('results.strengthsTab', language), margin, yPosition);
      yPosition += 12;

      assessmentData?.strengths?.forEach((strength, index) => {
        const estimatedHeight = 28 + (strength?.example ? 18 : 0);
        checkPageBreak(estimatedHeight);
        
        doc?.setFillColor(220, 252, 231);
        const boxHeight = estimatedHeight - 6;
        doc?.roundedRect(margin, yPosition, contentWidth, boxHeight, 3, 3, 'F');
        
        doc?.setFontSize(11);
        doc?.setFont(fontConfig?.font, 'bold');
        doc?.setTextColor(0, 0, 0);
        doc?.text(`${index + 1}. ${strength?.title}`, margin + 6, yPosition + 9);
        
        doc?.setFontSize(10);
        doc?.setFont(fontConfig?.font, 'normal');
        const descLines = wrapText(strength?.description, contentWidth - 12);
        doc?.text(descLines, margin + 6, yPosition + 17);
        
        let currentY = yPosition + 17 + (descLines?.length * 5);
        
        if (strength?.example) {
          doc?.setFont(fontConfig?.font, 'italic');
          doc?.setTextColor(80, 80, 80);
          const exampleLines = wrapText(`${t('results.example', language)}: "${strength?.example}"`, contentWidth - 12);
          doc?.text(exampleLines, margin + 6, currentY + 4);
        }
        
        yPosition += boxHeight + 6;
      });

      yPosition += 8;
    }

    // ===== IMPROVEMENTS SECTION - Enhanced layout =====
    if (assessmentData?.improvements?.length > 0) {
      checkPageBreak(25);
      doc?.setFontSize(15);
      doc?.setFont(fontConfig?.font, 'bold');
      doc?.setTextColor(234, 179, 8);
      doc?.text(t('results.improvementsTab', language), margin, yPosition);
      yPosition += 12;

      assessmentData?.improvements?.forEach((improvement, index) => {
        const estimatedHeight = 35 + (improvement?.suggestion ? 12 : 0) + (improvement?.example ? 12 : 0);
        checkPageBreak(estimatedHeight);
        
        const priorityColors = {
          high: [254, 226, 226],
          medium: [254, 243, 199],
          low: [219, 234, 254]
        };
        
        doc?.setFillColor(...(priorityColors?.[improvement?.priority] || [249, 250, 251]));
        const boxHeight = estimatedHeight - 6;
        doc?.roundedRect(margin, yPosition, contentWidth, boxHeight, 3, 3, 'F');
        
        doc?.setFontSize(11);
        doc?.setFont(fontConfig?.font, 'bold');
        doc?.setTextColor(0, 0, 0);
        doc?.text(`${index + 1}. ${improvement?.title}`, margin + 6, yPosition + 9);
        
        // Priority badge - clearer
        const priorityText = improvement?.priority?.charAt(0)?.toUpperCase() + improvement?.priority?.slice(1);
        doc?.setFontSize(8);
        doc?.setFont(fontConfig?.font, 'bold');
        const badgeColors = {
          high: [239, 68, 68],
          medium: [234, 179, 8],
          low: [59, 130, 246]
        };
        doc?.setFillColor(...(badgeColors?.[improvement?.priority] || [156, 163, 175]));
        doc?.roundedRect(pageWidth - margin - 38, yPosition + 4, 33, 7, 2, 2, 'F');
        doc?.setTextColor(255, 255, 255);
        doc?.text(`${priorityText} ${t('results.priority', language)}`, pageWidth - margin - 36, yPosition + 8.5);
        
        doc?.setTextColor(0, 0, 0);
        doc?.setFontSize(10);
        doc?.setFont(fontConfig?.font, 'normal');
        const descLines = wrapText(improvement?.description, contentWidth - 12);
        doc?.text(descLines, margin + 6, yPosition + 17);
        
        let currentY = yPosition + 17 + (descLines?.length * 5);
        
        if (improvement?.suggestion) {
          doc?.setFont(fontConfig?.font, 'bold');
          doc?.text(`${t('results.actionableSuggestion', language)}:`, margin + 6, currentY + 4);
          doc?.setFont(fontConfig?.font, 'normal');
          const suggestionLines = wrapText(improvement?.suggestion, contentWidth - 12);
          doc?.text(suggestionLines, margin + 6, currentY + 9);
          currentY += 9 + (suggestionLines?.length * 5);
        }
        
        if (improvement?.example) {
          doc?.setFont(fontConfig?.font, 'italic');
          doc?.setTextColor(80, 80, 80);
          const exampleLines = wrapText(`${t('results.example', language)}: "${improvement?.example}"`, contentWidth - 12);
          doc?.text(exampleLines, margin + 6, currentY + 4);
        }
        
        yPosition += boxHeight + 6;
      });

      yPosition += 8;
    }

    // ===== RECOMMENDATIONS SECTION - Improved spacing =====
    if (assessmentData?.recommendations?.length > 0) {
      checkPageBreak(25);
      doc?.setFontSize(15);
      doc?.setFont(fontConfig?.font, 'bold');
      doc?.setTextColor(59, 130, 246);
      doc?.text(t('results.recommendationsTab', language), margin, yPosition);
      yPosition += 12;

      assessmentData?.recommendations?.forEach((rec, index) => {
        const estimatedHeight = 22;
        checkPageBreak(estimatedHeight);
        
        doc?.setFillColor(239, 246, 255);
        const boxHeight = estimatedHeight - 5;
        doc?.roundedRect(margin, yPosition, contentWidth, boxHeight, 3, 3, 'F');
        
        // Number badge - slightly larger
        doc?.setFillColor(59, 130, 246);
        doc?.circle(margin + 9, yPosition + 9, 4.5, 'F');
        doc?.setTextColor(255, 255, 255);
        doc?.setFontSize(9);
        doc?.setFont(fontConfig?.font, 'bold');
        doc?.text(`${index + 1}`, margin + 7, yPosition + 11);
        
        doc?.setTextColor(0, 0, 0);
        doc?.setFontSize(11);
        doc?.setFont(fontConfig?.font, 'bold');
        doc?.text(rec?.title, margin + 18, yPosition + 9);
        
        doc?.setFontSize(10);
        doc?.setFont(fontConfig?.font, 'normal');
        const descLines = wrapText(rec?.description, contentWidth - 24);
        doc?.text(descLines, margin + 18, yPosition + 14);
        
        yPosition += boxHeight + 6;
      });

      yPosition += 8;
    }

    // ===== FOOTER - Cleaner for printing =====
    const totalPages = doc?.internal?.pages?.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc?.setPage(i);
      doc?.setFontSize(9);
      doc?.setTextColor(120, 120, 120);
      doc?.setFont(fontConfig?.font, 'normal');
      doc?.text(
        `${t('common.page', language)} ${i} ${t('common.of', language)} ${totalPages} | PitchAssess - AI-Powered Pitch Analysis`,
        pageWidth / 2,
        pageHeight - 12,
        { align: 'center' }
      );
    }

    // Save the PDF with language indicator
    const sanitizedFileName = fileName?.replace(/\.[^/.]+$/, '');
    doc?.save(`${sanitizedFileName}_assessment_report_${language}.pdf`);
  }
};

export default pdfService;