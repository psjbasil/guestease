const fs = require('fs');
const path = require('path');

// Simple mock audio file for testing timing
const mockAudioBuffer = Buffer.from('mock audio data');

// Mock the voice assistant service
async function testVoiceProcessingTiming() {
  console.log('='.repeat(60));
  console.log('VOICE PROCESSING TIMING TEST');
  console.log('='.repeat(60));
  
  try {
    // Import the voice assistant service (compiled JavaScript)
    const { processVoiceInput } = require('./dist/services/voiceAssistantService');
    
    console.log('Testing voice processing timing with mock audio...\n');
    
    const startTime = Date.now();
    const result = await processVoiceInput(mockAudioBuffer, 'test-session-timing');
    const endTime = Date.now();
    
    console.log('\n' + '='.repeat(60));
    console.log('TIMING RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    if (result.timing) {
      console.log(`Total Processing Time: ${result.timing.totalDuration}ms`);
      console.log(`Verification Total: ${endTime - startTime}ms`);
      console.log('\nStep-by-step breakdown:');
      console.log('-'.repeat(40));
      
      result.timing.steps.forEach((step, index) => {
        const percentage = ((step.duration / result.timing.totalDuration) * 100).toFixed(1);
        console.log(`${index + 1}. ${step.stepName}: ${step.duration}ms (${percentage}%)`);
      });
      
      console.log('-'.repeat(40));
      console.log(`Total: ${result.timing.totalDuration}ms (100.0%)`);
      
      // Performance analysis
      console.log('\n' + '='.repeat(60));
      console.log('PERFORMANCE ANALYSIS');
      console.log('='.repeat(60));
      
      const slowestStep = result.timing.steps.reduce((prev, current) => 
        (prev.duration > current.duration) ? prev : current
      );
      
      const fastestStep = result.timing.steps.reduce((prev, current) => 
        (prev.duration < current.duration) ? prev : current
      );
      
      console.log(`Slowest step: ${slowestStep.stepName} (${slowestStep.duration}ms)`);
      console.log(`Fastest step: ${fastestStep.stepName} (${fastestStep.duration}ms)`);
      
      // Performance recommendations
      const speechRecognitionStep = result.timing.steps.find(s => 
        s.stepName.includes('Speech Recognition')
      );
      const intentDetectionStep = result.timing.steps.find(s => 
        s.stepName.includes('Intent Detection')
      );
      const ttsStep = result.timing.steps.find(s => 
        s.stepName.includes('Text-to-Speech')
      );
      
      console.log('\nPerformance insights:');
      if (speechRecognitionStep && speechRecognitionStep.duration > 2000) {
        console.log('- Speech recognition is taking longer than expected (>2s)');
        console.log('  Consider optimizing audio format or Google Cloud region');
      }
      
      if (intentDetectionStep && intentDetectionStep.duration > 1000) {
        console.log('- Intent detection is slow (>1s)');
        console.log('  Consider optimizing Dialogflow training or using local cache');
      }
      
      if (ttsStep && ttsStep.duration > 1500) {
        console.log('- Text-to-speech synthesis is slow (>1.5s)');
        console.log('  Consider using shorter responses or audio caching');
      }
      
      if (result.timing.totalDuration < 3000) {
        console.log('✅ Overall performance is good (<3s total)');
      } else if (result.timing.totalDuration < 5000) {
        console.log('⚠️  Overall performance is acceptable (3-5s total)');
      } else {
        console.log('❌ Overall performance needs improvement (>5s total)');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('PROCESSING RESULT');
    console.log('='.repeat(60));
    console.log(`Transcript: "${result.transcript}"`);
    console.log(`Translated: "${result.translatedText}"`);
    console.log(`Intent: ${result.intent || 'None'}`);
    console.log(`Reply: "${result.replyText}"`);
    console.log(`Language: ${result.language}`);
    console.log(`Audio size: ${result.audio.length} characters (base64)`);
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('\nThis is expected if Google Cloud credentials are not configured.');
    console.error('The timing infrastructure is ready for real testing.');
  }
}

// Run the test
if (require.main === module) {
  testVoiceProcessingTiming().catch(console.error);
}

module.exports = { testVoiceProcessingTiming }; 