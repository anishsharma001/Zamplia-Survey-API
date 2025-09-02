const {  upsertStudyDemoDb,upsertStudyDemoOrder, upsertDemoAgeIntoDb ,upsertStudyisRouterEligible} = require('./getDemosFromZamplia');

  
 async function unimarketQualification(qualificationSurveys, allDBQualificationData, allDbOptions, lang_code) {
    try {
      let allStudyQualBundle = [];
      let allStudyAgeQualBundle = [];
      let allStudyQualOrderBundle = [];
      let unmappedSurveyIds=[];
      
  
      /**
       * Process the survey qualifications for each survey.
       * @param {Array} surveyIndex - Survey index.
       */
      const processSurvey = async (surveyIndex) => {
        
        if (surveyIndex && surveyIndex.hasOwnProperty("questions") && surveyIndex.questions.length) {
          const createQualificationBundle = await qualificationBundle(surveyIndex, allDBQualificationData, allDbOptions, lang_code);
          const { bundleNonRangeQualification, bundleRangeQualification,  bundleRangeOrder,unmapedSurvey } = createQualificationBundle;
          unmappedSurveyIds.push(...unmapedSurvey);
          allStudyQualBundle.push(...bundleNonRangeQualification);
          allStudyAgeQualBundle.push(...bundleRangeQualification);
          allStudyQualOrderBundle.push(...bundleRangeOrder);
        }
      };
  
      for (const surveyIndex of qualificationSurveys) {
        await processSurvey(surveyIndex);
      }
      if(allStudyQualBundle.length){
        await upsertStudyDemoDb(allStudyQualBundle); //insert
      }
      if(allStudyAgeQualBundle.length){
        await upsertDemoAgeIntoDb(allStudyAgeQualBundle); //insert
      }
      if(allStudyQualOrderBundle.length){
        await upsertStudyDemoOrder(allStudyQualOrderBundle) //insert
      } 
      if(unmappedSurveyIds.length){ 
          await upsertStudyisRouterEligible(unmappedSurveyIds);
      }
      return true;
    } catch (error) {
      return (`Oops! Something went wrong. ${error.message}`);
    }
  }
  

  async function qualificationBundle(unimrktQualification, allDBZampliaQualification, allDbOptions, lang_code) {
    try {
    
    
      const surveyId =  `UMT${unimrktQualification.surveyId}`;
      const allQuestions = unimrktQualification.questions;
      const date = new Date();
      const bundleNonRangeQualification = [];
      const bundleRangeQualification = [];
      const bundleRangeOrder = [];
      const unmapedSurvey=[];
      let screenerOrderNumber = 1;
      let notMatched = 0;
      for (const [index, question] of allQuestions.entries()) {
        const sqid = `${surveyId}_${question.questionId}` ;
        // sqId = surveyId + question.questionId;
        const filterQuestion = allDBZampliaQualification.find((d) => d.unimrktQid == question.questionId);
        if (!filterQuestion) {
          unmapedSurvey.push(surveyId);
          notMatched = 1;
          continue;
        }
        // let QuestionId = question.questionId;
        if (question.questionId == 1001|| question.questionId == 1085 ) {
          if (question.questionId == 1085) {
            const optionsText = question.options.join(',');
            bundleNonRangeQualification.push([
              sqid,
              surveyId,
              filterQuestion.demographicId,
              filterQuestion._id,
              "",
              optionsText,
              date,
              date,
              lang_code,
              sqid
            ]);
            bundleRangeOrder.push([
                surveyId,
                filterQuestion.demographicId,
                screenerOrderNumber, date, date,
                lang_code,sqid
            ]);
          } else {
            let minAge = '';
            let maxAge = '';                            
            let optionsId = question.options.map(o => o);
              if (optionsId.length > 1) {
                optionsId = optionsId.map(range => {
                   [minAge, maxAge] = range.split('-').map(Number);
                  return { minAge, maxAge };
              });
              } else {
                 [minAge, maxAge] = optionsId[0].split('-').map(Number);

              }
           
            bundleRangeQualification.push([
              sqid,
              surveyId,
              filterQuestion.demographicId,
              filterQuestion._id,
              maxAge,
              minAge,
              date,
              date,
              lang_code,
              sqid
            ]);
            bundleRangeOrder.push([
              surveyId,
              filterQuestion.demographicId,
              screenerOrderNumber, date, date,
              lang_code,sqid
            ])
          }
        } else {

          let optionValue = question.options.map(o => o);
          // Updating the existing filterOption variable
          const filterOptions = allDbOptions.filter((obj1) =>
            optionValue.some((obj2) => obj2 == obj1.unimrktOid && obj1.queryId === filterQuestion._id)
            );
            
          let optionsId = filterOptions.map((d) => d._id).join(",");   
          bundleNonRangeQualification.push([
            sqid,
            surveyId,
            filterQuestion.demographicId,
            filterQuestion._id,
            optionsId,
            "",
            date,
            date,
            lang_code,
            sqid
          ]);
          bundleRangeOrder.push([
            surveyId,
            filterQuestion.demographicId,
            screenerOrderNumber, date, date,
            lang_code,sqid
        ]);
        }
        screenerOrderNumber++;
      }
      const data = { bundleNonRangeQualification, bundleRangeQualification, bundleRangeOrder,unmapedSurvey};
      return data;
    } catch (error) {
      return(`Oops! Something went wrong. ${error}`);
    }
  }
  
  module.exports = { unimarketQualification };
