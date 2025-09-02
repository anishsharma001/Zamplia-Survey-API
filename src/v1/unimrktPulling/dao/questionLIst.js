const questionList = [{
   "questions": [
      {
         "questionId": 1001,
         "name": "Age",
         "desc": "What is your age?",
         "typeId": 4
      },
      {
         "questionId": 1002,
         "name": "GENDER",
         "desc": "What is your gender?",
         "typeId": 1
      },
      {
         "questionId": 1003,
         "name": "STANDARD_RELATIONSHIP",
         "desc": "What is your relationship status?",
         "typeId": 1
      },
      {
         "questionId": 1004,
         "name": "STANDARD_EDUCATION",
         "desc": "What is the highest level of education you have completed?",
         "typeId": 1
      },
      {
         "questionId": 1005,
         "name": "STANDARD_HHI_US",
         "desc": "How much total combined income do all members of your household earn before taxes?",
         "typeId": 1
      },
      {
         "questionId": 1006,
         "name": "Parental_Status_Standard",
         "desc": "Please choose the options that best describe your household:",
         "typeId": 2
      },
      {
         "questionId": 1007,
         "name": "Age_and_Gender_of_Child",
         "desc": "Please indicate the age(s) and gender(s) of your child or children:",
         "typeId": 2
      },
      {
         "questionId": 1008,
         "name": "STANDARD_PRIMARY_DECISION_MAKER",
         "desc": "In your household, are you the person who makes most of the daily purchasing decisions?",
         "typeId": 1
      },
      {
         "questionId": 1009,
         "name": "STANDARD_PETS",
         "desc": "Which of the following pets are present in your household?  Please select all that apply",
         "typeId": 2
      },
      {
         "questionId": 1010,
         "name": "STANDARD_TOTAL_HOUSEHOLD",
         "desc": "How many people live in your household, including yourself?",
         "typeId": 1
      },
      {
         "questionId": 1011,
         "name": "STANDARD_HOUSEHOLD_TYPE",
         "desc": "What best describes your current household?",
         "typeId": 1
      },
      {
         "questionId": 1012,
         "name": "STANDARD_INDUSTRY_PERSONAL",
         "desc": "Which of the following best describes the industry that you, personally, work in?",
         "typeId": 1
      },
      {
         "questionId": 1013,
         "name": "STANDARD_INDUSTRY",
         "desc": "Do you, or does anyone in your household, work in any of the following industries?",
         "typeId": 2
      },
      {
         "questionId": 1014,
         "name": "STANDARD_No_OF_EMPLOYEES",
         "desc": "Approximately how many employees work at your organization (all locations)?",
         "typeId": 1
      },
      {
         "questionId": 1015,
         "name": "STANDARD_COMPANY_REVENUE",
         "desc": "Approximately what is the annual revenue for your organization?",
         "typeId": 1
      },
      {
         "questionId": 1016,
         "name": "STANDARD_COMPANY_DEPARTMENT",
         "desc": "Which department do you primarily work within at your organization?",
         "typeId": 1
      },
      {
         "questionId": 1017,
         "name": "STANDARD_JOB_TITLE",
         "desc": "What is your job title, level or responsibility?",
         "typeId": 1
      },
      {
         "questionId": 1018,
         "name": "STANDARD_B2B_DECISION_MAKER",
         "desc": "Please choose which departments/products you have the decision making authority or influence over spending/purchasing?",
         "typeId": 2
      },
      {
         "questionId": 1019,
         "name": "STANDARD_CAR_OWNER",
         "desc": "Do you own a car?",
         "typeId": 1
      },
      {
         "questionId": 1020,
         "name": "STANDARD_AUTO_DECISION_MAKER",
         "desc": "Are you the primary decision maker in your household for automotive-related purchases?",
         "typeId": 1
      },
      {
         "questionId": 1021,
         "name": "STANDARD_AUTO_BRANDS",
         "desc": "If you own/lease a car(s), which brand(s) are they?",
         "typeId": 2
      },
      {
         "questionId": 1022,
         "name": "STANDARD_AUTO_TYPE",
         "desc": "How would you describe the vehicle(s) you own/lease?",
         "typeId": 2
      },
      {
         "questionId": 1023,
         "name": "STANDARD_AUTO_MANUFACTURE_DATE",
         "desc": "In which year was your main vehicle (owned or leased) manufactured?",
         "typeId": 1
      },
      {
         "questionId": 1024,
         "name": "STANDARD_AUTO_PURCHASE_DATE",
         "desc": "In which year did you purchase or lease your main vehicle?",
         "typeId": 1
      },
      {
         "questionId": 1025,
         "name": "STANDARD_AUTO_PURCHASE_TYPE",
         "desc": "If you own/lease a vehicle(s), did you buy them new or used?",
         "typeId": 1
      },
      {
         "questionId": 1026,
         "name": "STANDARD_AUTO_FUTURE_PURCHASE_20",
         "desc": "When do you estimate that you will purchase or lease your next car?",
         "typeId": 1
      },
      {
         "questionId": 1027,
         "name": "STANDARD_AUTO_MOTORCYCLE",
         "desc": "Do you own a motorcycle?",
         "typeId": 1
      },
      {
         "questionId": 1028,
         "name": "STANDARD_FAST_FOOD_FREQUENCY",
         "desc": "How often do you eat fast food (any quick service restaurant) in any given week (on average)?",
         "typeId": 1
      },
      {
         "questionId": 1029,
         "name": "STANDARD_FAST_FOOD_VISIT",
         "desc": "Which fast food (quick service) restaurants have you ever visited?",
         "typeId": 2
      },
      {
         "questionId": 1030,
         "name": "STANDARD_BEVERAGE_P4W",
         "desc": "Which, if any, of these drinks have you consumed in the past four weeks?",
         "typeId": 2
      },
      {
         "questionId": 1031,
         "name": "STANDARD_BEVERAGE_REGULARLY",
         "desc": "Which of the following beverages do you regularly consume?",
         "typeId": 2
      },
      {
         "questionId": 1032,
         "name": "STANDARD_ALCOHOL_FREQUENCY",
         "desc": "On average, how many alcoholic drinks do you consume in a week?",
         "typeId": 1
      },
      {
         "questionId": 1033,
         "name": "STANDARD_HOBBIES",
         "desc": "What are your hobbies and interests?",
         "typeId": 2
      },
      {
         "questionId": 1034,
         "name": "STANDARD_MOVIE_FREQUENCY",
         "desc": "How often do you go to the movie theater?",
         "typeId": 1
      },
      {
         "questionId": 1035,
         "name": "STANDARD_MOVIE_GENRE",
         "desc": "What kinds of movies do you watch when you go to the movie theater?",
         "typeId": 2
      },
      {
         "questionId": 1036,
         "name": "STANDARD_MOVIE_HOME_WATCHING",
         "desc": "How frequently do you rent or download movies for home viewing (on average)?",
         "typeId": 1
      },
      {
         "questionId": 1037,
         "name": "STANDARD_DVD_PURCHASE",
         "desc": "How many DVDs/Blu-rays do you purchase on a monthly basis (on average)?",
         "typeId": 1
      },
      {
         "questionId": 1038,
         "name": "STANDARD_EXERCISE_HOURS",
         "desc": "How many hours a week do you exercise/participate in sports?",
         "typeId": 1
      },
      {
         "questionId": 1039,
         "name": "STANDARD_SPORTS",
         "desc": "What sports do you regularly participate in?",
         "typeId": 2
      },
      {
         "questionId": 1040,
         "name": "STANDARD_GAMBLING",
         "desc": "What kind of gambling do you participate in?",
         "typeId": 2
      },
      {
         "questionId": 1041,
         "name": "STANDARD_ELECTRONICS",
         "desc": "Which of the following electronic products do you own?",
         "typeId": 2
      },
      {
         "questionId": 1042,
         "name": "STANDARD_EARLY_ADOPTER",
         "desc": "Would you consider yourself to be an early adopter of new technology (the first to buy new gadgets/electronics/etc.)?",
         "typeId": 1
      },
      {
         "questionId": 1043,
         "name": "STANDARD_CELL_CARRIER",
         "desc": "Which of these is your carrier for your primary mobile/cell phone?",
         "typeId": 1
      },
      {
         "questionId": 1044,
         "name": "STANDARD_CELL_PLAN",
         "desc": "What type of mobile phone plan do you have?",
         "typeId": 1
      },
      {
         "questionId": 1045,
         "name": "STANDARD_SMART_PHONE",
         "desc": "Do you use a smart phone?",
         "typeId": 1
      },
      {
         "questionId": 1046,
         "name": "STANDARD_INTERNET_TYPE",
         "desc": "What kind of internet connection(s) do you use at home?",
         "typeId": 1
      },
      {
         "questionId": 1047,
         "name": "STANDARD_MOVIE_DOWNLOAD",
         "desc": "Do you have access to download movies through gaming console, digital receiver, Blu-ray/DVD player or similar devices?",
         "typeId": 1
      },
      {
         "questionId": 1048,
         "name": "STANDARD_GAMING_PLATFORMS",
         "desc": "Which gaming platforms do you regularly use?",
         "typeId": 2
      },
      {
         "questionId": 1049,
         "name": "STANDARD_GAMING_TYPE",
         "desc": "What kind(s) of video/computer games do you play?",
         "typeId": 2
      },
      {
         "questionId": 1050,
         "name": "STANDARD_GAMING_HOURS",
         "desc": "How many hours per week do you spend playing video/computer games?",
         "typeId": 1
      },
      {
         "questionId": 1051,
         "name": "STANDARD_GAMING_PARTNERS",
         "desc": "How do you play video/computer games?",
         "typeId": 2
      },
      {
         "questionId": 1052,
         "name": "STANDARD_GAMING_DEVICE",
         "desc": "Which of the following devices do you use to play games?",
         "typeId": 2
      },
      {
         "questionId": 1053,
         "name": "STANDARD_GAMING_PURCHASE",
         "desc": "On average, how many computer/video games a month do you purchase?",
         "typeId": 1
      },
      {
         "questionId": 1054,
         "name": "STANDARD_GAMING_ONLINE",
         "desc": "Do you play video games with others online (e.g. Xbox Live or World of Warcraft)?",
         "typeId": 1
      },
      {
         "questionId": 1055,
         "name": "STANDARD_TELEVISION_FREQUENCY",
         "desc": "On average, how many hours of television do you watch per week?",
         "typeId": 1
      },
      {
         "questionId": 1056,
         "name": "STANDARD_RADIO_FREQUENCY",
         "desc": "On average, how many hours of radio do you listen to per week?",
         "typeId": 1
      },
      {
         "questionId": 1057,
         "name": "STANDARD_PUBLICATIONS",
         "desc": "Which types of publications do you read?",
         "typeId": 2
      },
      {
         "questionId": 1058,
         "name": "STANDARD_FLIGHT_PURPOSE",
         "desc": "For which purposes do you travel by plane?",
         "typeId": 1
      },
      {
         "questionId": 1059,
         "name": "STANDARD_FLIGHT_DESTINATION",
         "desc": "When you fly, which types of flights do you take?",
         "typeId": 1
      },
      {
         "questionId": 1060,
         "name": "STANDARD_DOMESTIC_AIRLINES",
         "desc": "Which international airlines have you flown with during the last 12 months?",
         "typeId": 2
      },
      {
         "questionId": 1061,
         "name": "STANDARD_INTERNATIONAL_AIRLINES",
         "desc": "Which international airlines have you flown with during the last 12 months?",
         "typeId": 2
      },
      {
         "questionId": 1062,
         "name": "STANDARD_COUNTRIES_VISITED",
         "desc": "Which of the following countries/regions have you traveled to in the last 12 months?",
         "typeId": 2
      },
      {
         "questionId": 1063,
         "name": "STANDARD_HOTEL_TYPE",
         "desc": "Of these hotel chains, which one(s) have you stayed at during the last 12 months?",
         "typeId": 2
      },
      {
         "questionId": 1064,
         "name": "STANDARD_SMOKING",
         "desc": "Do you smoke?",
         "typeId": 1
      },
      {
         "questionId": 1065,
         "name": "STANDARD_CIGARETTE_FREQUENCY",
         "desc": "On average, how many cigarettes do you smoke in a day?",
         "typeId": 1
      },
      {
         "questionId": 1066,
         "name": "STANDARD_SMOKING_QUIT_TYPE",
         "desc": "Have you tried to quit smoking using any of these products/methods?",
         "typeId": 2
      },
      {
         "questionId": 1067,
         "name": "STANDARD_DIAGNOSED_AILMENTS_I",
         "desc": "Have you been diagnosed with any of the following illnesses/conditions? Note that the information will be kept in strictest confidence.",
         "typeId": 2
      },
      {
         "questionId": 1068,
         "name": "STANDARD_DIAGNOSED_AILMENTS_II",
         "desc": "Have you been diagnosed with any of the following illnesses/conditions? Note that the information will be kept in strictest confidence.",
         "typeId": 2
      },
      {
         "questionId": 1069,
         "name": "STANDARD_SUFFERER_AILMENTS_I",
         "desc": "Do you suffer from any of the following illnesses/conditions?",
         "typeId": 2
      },
      {
         "questionId": 1070,
         "name": "STANDARD_SUFFERER_AILMENTS_II",
         "desc": "Do you suffer from any of the following illnesses/conditions?",
         "typeId": 2
      },
      {
         "questionId": 1071,
         "name": "STANDARD_CANCER_TYPE",
         "desc": "If you stated that you have been diagnosed with cancer, can you define the type of cancer?",
         "typeId": 2
      },
      {
         "questionId": 1072,
         "name": "STANDARD_DIABETES_TYPE",
         "desc": "If you stated that you have been diagnosed with diabetes, can you define the type of diabetes?",
         "typeId": 2
      },
      {
         "questionId": 1073,
         "name": "STANDARD_HEPATITIS_TYPE",
         "desc": "If you stated that you have been diagnosed with hepatitis, can you define the type of hepatitis?",
         "typeId": 2
      },
      {
         "questionId": 1074,
         "name": "STANDARD_HH_DIAGNOSED_AILMENTS_I",
         "desc": "Has anyone else in your household been diagnosed with any of the following illnesses/conditions? Note that the information will be kept in strictest confidence.",
         "typeId": 2
      },
      {
         "questionId": 1075,
         "name": "STANDARD_HH_DIAGNOSD_AILMENTS_II",
         "desc": "Has anyone else in your household been diagnosed with any of the following illnesses/conditions? Note that the information will be kept in strictest confidence.",
         "typeId": 2
      },
      {
         "questionId": 1076,
         "name": "STANDARD_HH_SUFFERER_AILMENTS_I",
         "desc": "Does anyone else in your household suffer from any of the following illnesses/conditions?",
         "typeId": 2
      },
      {
         "questionId": 1077,
         "name": "STANDARD_HH_SUFFERER_AILMENTS_II",
         "desc": "Does anyone else in your household suffer from any of the following illnesses/conditions?",
         "typeId": 2
      },
      {
         "questionId": 1078,
         "name": "STANDARD_CARE_GIVER_I",
         "desc": "Are you a caregiver and in contact at least once a week with someone with any of the following ailments?",
         "typeId": 2
      },
      {
         "questionId": 1079,
         "name": "STANDARD_CARE_GIVER_II",
         "desc": "Are you a caregiver and in contact at least once a week with someone with any of the following ailments?",
         "typeId": 2
      },
      {
         "questionId": 1080,
         "name": "STANDARD_HH_CANCER",
         "desc": "If you stated that someone in your household has been diagnosed with cancer, can you define the type of cancer?",
         "typeId": 2
      },
      {
         "questionId": 1081,
         "name": "STANDARD_HH_DIABETES",
         "desc": "If you stated that someone in your household has been diagnosed with diabetes, can you define the type of diabetes?",
         "typeId": 2
      },
      {
         "questionId": 1082,
         "name": "STANDARD_HH_HEPATITIS",
         "desc": "If you stated that someone in your household has been diagnosed with hepatitis, can you define the type of hepatitis?",
         "typeId": 2
      },
      {
         "questionId": 1083,
         "name": "STANDARD_EYEWARE",
         "desc": "Do you use glasses or contact lenses?",
         "typeId": 1
      },
      {
         "questionId": 1084,
         "name": "STANDARD_HEARING_AID",
         "desc": "Do you use a hearing aid?",
         "typeId": 1
      },
      {
         "questionId": 1085,
         "name": "ZIP",
         "desc": "What is your zipcode?",
         "typeId": 3
      },
      {
         "questionId": 1086,
         "name": "Standard_Internet_Frequency",
         "desc": "How often do you go online on a computer (desktop, laptop, netbook, or tablet)? This includes access to the Internet from home, work, or elsewhere (including weekdays and weekends).",
         "typeId": 1
      },
      {
         "questionId": 1087,
         "name": "STANDARD_EMPLOYMENT",
         "desc": "What is your current employment status?",
         "typeId": 1
      },
      {
         "questionId": 1088,
         "name": "STANDARD_RELIGION",
         "desc": "Which of the following religions do you most closely identify with?",
         "typeId": 1
      },
      {
         "questionId": 1089,
         "name": "STANDARD_SEXUAL_ORIENTATION_EN",
         "desc": "What is your sexual orientation?",
         "typeId": 1
      },
      {
         "questionId": 1090,
         "name": "ETHNICITY",
         "desc": "Which of the following best describes your race?",
         "typeId": 1
      },
      {
         "questionId": 1091,
         "name": "HISPANIC",
         "desc": "Are you of Hispanic, Latino or Spanish origin?",
         "typeId": 1
      },
      {
         "questionId": 1092,
         "name": "STANDARD_VOTE",
         "desc": "Are you registered to vote?",
         "typeId": 1
      },
      {
         "questionId": 1093,
         "name": "DMA",
         "desc": "What is your DMA?",
         "typeId": 1
      },
      {
         "questionId": 1094,
         "name": "STATE",
         "desc": "What is your state?",
         "typeId": 1
      },
      {
         "questionId": 1095,
         "name": "CAR_MODEL_US_STANDARD",
         "desc": "Please select the model of the car you own.",
         "typeId": 1
      },
      {
         "questionId": 1097,
         "name": "STANDARD_SEXUAL_ORIENTATION",
         "desc": "What is your sexual orientation?",
         "typeId": 1
      },
      {
         "questionId": 1108,
         "name": "DIVISION",
         "desc": "What is your DIVISION?",
         "typeId": 1
      },
      {
         "questionId": 1109,
         "name": "REGION",
         "desc": "What is your region?",
         "typeId": 1
      },
      {
         "questionId": 1197,
         "name": "Ethnicity II",
         "desc": "What best describes your ethnicity?",
         "typeId": 1
      },
      {
         "questionId": 1201,
         "name": "Standard PII",
         "desc": "Are you willing to share your personal information in the survey?",
         "typeId": 1
      },
      {
         "questionId": 1202,
         "name": "STANDARD_HISPANIC_ACCULTURATION",
         "desc": "Would you say that in your household you speak…? Diría que en su hogar usted habla…?",
         "typeId": 1
      },
      {
         "questionId": 1204,
         "name": "STANDARD HOME OWNER",
         "desc": "Which of the following describes your current living situation?",
         "typeId": 1
      },
      {
         "questionId": 1228,
         "name": "STANDARD_ITDM",
         "desc": "Which of the following best describes your primary role at work?",
         "typeId": 1
      },
      {
         "questionId": 1231,
         "name": "STANDARD_CHILD_PARTICIPATE",
         "desc": "You have indicated that you have a child in the household under the age of 18. Is your child available to come to the computer and participate in a survey with your assistance?",
         "typeId": 1
      },
      {
         "questionId": 1234,
         "name": "STANDARD_GROCERY_SHOPPER",
         "desc": "Are you the primary decision maker in your household for grocery purchases?",
         "typeId": 1
      },
      {
         "questionId": 1237,
         "name": "STANDARD_HHI_US_2016",
         "desc": "How much total combined income do all members of your household earn before taxes?",
         "typeId": 1
      },
      {
         "questionId": 1238,
         "name": "STANDARD_EDUCATION_2016",
         "desc": "What is the highest level of education you have completed?",
         "typeId": 1
      },
      {
         "questionId": 1239,
         "name": "STANDARD_FINANCIAL_PRODUCT",
         "desc": "Which of the following financial products do you currently have, on your own or jointly with others?",
         "typeId": 2
      },
      {
         "questionId": 1242,
         "name": "Truck_onwer",
         "desc": "What type of vehicle do you drive most often?",
         "typeId": 2
      },
      {
         "questionId": 1245,
         "name": "MSA",
         "desc": "What is your MSA",
         "typeId": 1
      },
      {
         "questionId": 1246,
         "name": "CSA",
         "desc": "What is your CSA?",
         "typeId": 1
      },
      {
         "questionId": 1247,
         "name": "County",
         "desc": "What is your County?",
         "typeId": 1
      },
      {
         "questionId": 1248,
         "name": "Vehicle_Owner",
         "desc": "Do you own or lease a vehicle? Please select all that apply.",
         "typeId": 2
      },
      {
         "questionId": 1250,
         "name": "contractors_NEW",
         "desc": "What is your title?",
         "typeId": 1
      },
      {
         "questionId": 1253,
         "name": "STANDARD_DRIVER_LICENSE",
         "desc": "Do you possess a driver's license?",
         "typeId": 1
      },
      {
         "questionId": 1256,
         "name": "STANDARD JOB SEARCH",
         "desc": "In the last year, have you engaged in any of the following job-related activities?",
         "typeId": 2
      },
      {
         "questionId": 1257,
         "name": "STANDARD AIRLINE LOYALTY",
         "desc": "Do you belong to any of the following hotel loyalty programs?",
         "typeId": 2
      },
      {
         "questionId": 1258,
         "name": "STANDARD HOTEL LOYALTY",
         "desc": "Do you belong to any of the following hotel loyalty programs?",
         "typeId": 2
      },
      {
         "questionId": 1260,
         "name": "STANDARD_TV_PROVIDER",
         "desc": "Which of the following television providers do you subscribe to at your primary residence?",
         "typeId": 2
      },
      {
         "questionId": 1261,
         "name": "STANDARD WEBCAM",
         "desc": "Do you have a webcam and are you willing to use it for an online research opportunity?",
         "typeId": 1
      },
      {
         "questionId": 1262,
         "name": "STANDARD HH ASSETS",
         "desc": "What are your household investable assets (not including homeownership)?",
         "typeId": 1
      },
      {
         "questionId": 1263,
         "name": "STANDARD SMARTPHONE TYPE",
         "desc": "What type of smartphone do you primarily use?",
         "typeId": 1
      },
      {
         "questionId": 1266,
         "name": "STANDARD_SOCIAL_MEDIA_USAGE",
         "desc": "About how often do you access social media services (Facebook, Twitter, Instagram, Pinterest,  YouTube, etc.)? ",
         "typeId": 1
      },
      {
         "questionId": 1267,
         "name": "STANDARD_SOCIAL_MEDIA",
         "desc": "Which of the following social media platforms do you use or actively participate in?",
         "typeId": 2
      },
      {
         "questionId": 1268,
         "name": "CORE_HEALTH_0020",
         "desc": "Which type of diabetes have you been diagnosed with?",
         "typeId": 1
      },
      {
         "questionId": 1269,
         "name": "STANDARD_HHI",
         "desc": "What is your current annual household income before taxes?",
         "typeId": 1
      },
      {
         "questionId": 1271,
         "name": "STANDARD_HH_INVESTMENTS",
         "desc": "What kinds of savings and/or investment accounts do you have?",
         "typeId": 2
      },
      {
         "questionId": 1272,
         "name": "STANDARD_SUPPLEMENTAL_INCOME",
         "desc": "Do you participate in any of the following activities either full-time or as supplemental income? Select all that apply.",
         "typeId": 2
      },
      {
         "questionId": 1273,
         "name": "STANDARD_ORGANIZATION_TYPE",
         "desc": "Which of the following best describes your organization?",
         "typeId": 1
      },
      {
         "questionId": 1274,
         "name": "STANDARD_INDUSTRY_EDUCATION",
         "desc": "Which of the following best describes your current profession?",
         "typeId": 1
      },
      {
         "questionId": 1275,
         "name": "STANDARD_INDUSTRY_CONSTRUCTION",
         "desc": "Which of the following best describes your current profession?",
         "typeId": 1
      },
      {
         "questionId": 1276,
         "name": "STANDARD_INDUSTRY_IT",
         "desc": "Which IT role(s)/function(s) do you operate within? Please select all that apply.",
         "typeId": 2
      },
      {
         "questionId": 1277,
         "name": "STANDARD_INDUSTRY_HEALTHCARE",
         "desc": "Which of the following best describes your current profession?",
         "typeId": 1
      },
      {
         "questionId": 1278,
         "name": "STANDARD_MILITARY_SERVICE",
         "desc": "Do you, or have you ever, served in the United States Military?",
         "typeId": 1
      },
      {
         "questionId": 1280,
         "name": "STANDARD_HH_RESPONSIBILITY",
         "desc": "In your household, which of the following things are you responsible or partially responsible for making decisions about?",
         "typeId": 1
      },
      {
         "questionId": 1284,
         "name": "Standard_Political_Party",
         "desc": "Please select your political party affiliation/preference in today's politics.",
         "typeId": 1
      },
      {
         "questionId": 1290,
         "name": "KIDS_STANDARD",
         "desc": "How many children do you have under the age of 18?",
         "typeId": 3
      },
      {
         "questionId": 1306,
         "name": "Sample_Cube_Counties",
         "desc": "In which county do you live?",
         "typeId": 1
      },
      {
         "questionId": 1314,
         "name": "Standard_Health_Insurance",
         "desc": "What best describes your current health insurance?",
         "typeId": 1
      },
      {
         "questionId": 1324,
         "name": "Standard_Television_Watching_Weekly",
         "desc": "How many weekdays do you spend at home and watching at least some television?",
         "typeId": 1
      },
      {
         "questionId": 1330,
         "name": "Standard_Major_Subject_ university",
         "desc": "What is/was your major at university/college?",
         "typeId": 1
      },
      {
         "questionId": 1331,
         "name": "STANDARD_TOBACCO_PRODUCTS",
         "desc": "Do you use any of the following tobacco products?",
         "typeId": 2
      },
      {
         "questionId": 1334,
         "name": "STANDARD_SUFFERER_AILMENTS_New",
         "desc": "Have you been diagnosed with any of the following illnesses/conditions?",
         "typeId": 2
      },
      {
         "questionId": 1335,
         "name": "STANDARD_ALCOHOL",
         "desc": "Which, if any, of these drinks have you consumed in the past four weeks?",
         "typeId": 2
      },
      {
         "questionId": 1339,
         "name": "STANDARD_SMARTPHONE_BRAND",
         "desc": "If you use a smart phone for personal purposes, what brand is it?",
         "typeId": 1
      },
      {
         "questionId": 1341,
         "name": "STANDARD_URBAN_RURAL",
         "desc": "Which of the following best describes the area you live in?",
         "typeId": 1
      },
      {
         "questionId": 1342,
         "name": "STANDARD_PURCHASE_CATEGORY",
         "desc": "Which of the following categories have you purchased in the past 12 months?",
         "typeId": 2
      },
      {
         "questionId": 1346,
         "name": "STANDARD_City size",
         "desc": "Based on the population of CSAs and CBSAs, harmonized on a county level",
         "typeId": 1
      },
      {
         "questionId": 1352,
         "name": "STANDARD_Metropolitan divisions",
         "desc": "Metropolitan statistical areas are composed of CSAs and CBSAs, sourced from US Office of Management and Budget",
         "typeId": 1
      },
      {
         "questionId": 1353,
         "name": "STANDARD_Nielsen county size_US",
         "desc": "A pre-defined attribute that divides counties into A/B/C/D  based on population, A being the largest",
         "typeId": 1
      },
      {
         "questionId": 1354,
         "name": "STANDARD_BANK",
         "desc": "Which of the following is your primary bank?",
         "typeId": 1
      },
      {
         "questionId": 1360,
         "name": "STANDARD_NUMBER_ OF_ CHILDREN",
         "desc": "How many children under 18 live in your household?",
         "typeId": 1
      },
      {
         "questionId": 1366,
         "name": "STANDARD_IT_POSITION",
         "desc": "If you work in your organization's IT department, please provide more detail about your role",
         "typeId": 1
      },
      {
         "questionId": 1374,
         "name": "STANDARD_CAR_INSURANCE",
         "desc": "Which of the following companies do you currently have car insurance with?",
         "typeId": 1
      },
      {
         "questionId": 1375,
         "name": "STANDARD_NUMBER_OF_CAR",
         "desc": "How many cars are there in your household (including leasing or company cars)?",
         "typeId": 1
      },
      {
         "questionId": 1376,
         "name": "STANDARD_CAR_OPTIONS",
         "desc": "Please also indicate which of the following statements apply to you?",
         "typeId": 2
      },
      {
         "questionId": 1377,
         "name": "STANDARD_Smartphone_operating_system",
         "desc": "Which of the following operating systems does your personal mobile phone run on?",
         "typeId": 1
      },
      {
         "questionId": 1382,
         "name": "Standard_Travel_DM",
         "desc": "Which of the following best describes what role you play when making traveling decisions for you and your household?",
         "typeId": 1
      },
      {
         "questionId": 1384,
         "name": "STANDARD_HEALTH_INSURANCE_US",
         "desc": "What best describes your current health insurance?",
         "typeId": 1
      },
      {
         "questionId": 1385,
         "name": "STANDARD_BIG_PURCHASES",
         "desc": "Which of the following products have you purchased in the last 2 years, or intend to buy in the next 12 months?",
         "typeId": 2
      },
      {
         "questionId": 1386,
         "name": "STANDARD_GROCERY_STORES",
         "desc": "Which of the following grocery stores do you regularly shop at?",
         "typeId": 2
      },
      {
         "questionId": 1388,
         "name": "STANDARD_INTERNET_PROVIDER",
         "desc": "Which of the following is your primary home internet service provider?",
         "typeId": 1
      },
      {
         "questionId": 1389,
         "name": "STANDARD_NEXT_CAR_PURCHASE",
         "desc": "When do you estimate that you will purchase/lease your next car?",
         "typeId": 1
      },
      {
         "questionId": 1393,
         "name": "STANDARD_BUSINESS_FLIGHTS",
         "desc": "How often do you fly for business?",
         "typeId": 1
      },
      {
         "questionId": 1399,
         "name": "STANDARD_US_TV_SHOWS",
         "desc": "Which of the following TV Shows do you currently watch (the current season)?",
         "typeId": 2
      },
      {
         "questionId": 1404,
         "name": "STANDARD_DIET",
         "desc": "Do you adhere to one or more of the following diets or dietary restrictions?",
         "typeId": 2
      },
      {
         "questionId": 1406,
         "name": "STANDARD_ONLINE_STREAMING_APP",
         "desc": "Which of the following online streaming app do you subscribe to or use?",
         "typeId": 2
      },
      {
         "questionId": 1409,
         "name": "STANDARD_OCCUPATION",
         "desc": "Which of the following best describes your primary occupation?",
         "typeId": 1
      },
      {
         "questionId": 1410,
         "name": "Beverage_Regularity_Alcohol",
         "desc": "Which of the following alcoholic beverages do you regularly consume?",
         "typeId": 2
      },
      {
         "questionId": 1411,
         "name": "STANDARD_CAR_INSURANCE_US",
         "desc": "Which of the following companies do you currently have car insurance with?",
         "typeId": 1
      },
      {
         "questionId": 1414,
         "name": "STANDARD_CAR_SHARING_PROVIDER",
         "desc": "Please also indicate the following for the main car for you: Purchased/leased as Brand New car or second hand car?",
         "typeId": 1
      },
      {
         "questionId": 1415,
         "name": "STANDARD_HCAL_PARENTS_0TO17_YO",
         "desc": "Are you parents of kids between 0 and 17 years?",
         "typeId": 2
      },
      {
         "questionId": 1416,
         "name": "STANDARD_BABY",
         "desc": "Are you currently expecting a baby?",
         "typeId": 1
      },
      {
         "questionId": 1417,
         "name": "STANDARD_HCAL_PARENTS_BABIES_0TO48_MONTHS",
         "desc": "Are you Parents of babies between 0 and 48 months ?",
         "typeId": 2
      },
      {
         "questionId": 1418,
         "name": "STANDARD_ELECTRONIC_CIGARETTES_FREQUENCY",
         "desc": "You mentioned you smoke electronic cigarettes. How frequently do you use them?",
         "typeId": 1
      },
      {
         "questionId": 1419,
         "name": "STANDARD_READY MADE_CIGARETTES_FREQUENCY",
         "desc": "You mentioned you smoke ready-made filter cigarettes. How frequently do you use them?",
         "typeId": 1
      },
      {
         "questionId": 1421,
         "name": "STANDARD_BUSINESS_TRIPS",
         "desc": "About how many business trips have you taken by plane in the past 12 months?",
         "typeId": 2
      },
      {
         "questionId": 1422,
         "name": "STANDARD_PERSONAL_TRIPS",
         "desc": "About how many personal trips have you taken by plane in the past 12 months?",
         "typeId": 2
      },
      {
         "questionId": 1431,
         "name": "STANDARD_STOCK_TRADING",
         "desc": "If you actively participate in stock trading, how do you do your trading?",
         "typeId": 1
      },
      {
         "questionId": 1432,
         "name": "STANDARD_BUSINESS_OWNER",
         "desc": "Do you own or operate a business?",
         "typeId": 1
      },
      {
         "questionId": 1433,
         "name": "STANDARD_HOUSEHOLD_DM_PRODUCTS",
         "desc": "In your household, are you the primary decision maker for purchasing any of the following? Please select all that apply.",
         "typeId": 2
      },
      {
         "questionId": 1434,
         "name": "STANDARD_HH_PERSONAL_PRODUCTS",
         "desc": "Which of the following products do you use on a regular basis? Please select all that apply.",
         "typeId": 2
      },
      {
         "questionId": 1435,
         "name": "STANDARD_INSURANCE_TYPE",
         "desc": "Which of the following accounts or policies do you have?  Please select all that apply.",
         "typeId": 2
      },
      {
         "questionId": 1436,
         "name": "STANDARD_OCCUPATION_CONSTRUCTION",
         "desc": "Which of the following best describes your PRIMARY occupation, trade, or role in Construction?",
         "typeId": 1
      },
      {
         "questionId": 1460,
         "name": "STANDARD_OPERATING_SYSTEM",
         "desc": "What operating system do you currently have and use at home? Please select all that apply.",
         "typeId": 2
      },
      {
         "questionId": 1480,
         "name": "Beverage_Regularity_Soft",
         "desc": "Which of the following non-alcoholic beverages do you regularly consume?",
         "typeId": 2
      },
      {
         "questionId": 1512,
         "name": "Data Matching and Enrichment 2",
         "desc": "With regards to the previous question, this list presents all current partners. You have the choice to select/deselect companies listed below.",
         "typeId": 2
      },
      {
         "questionId": 1513,
         "name": "Advertising Targeting and Media Buying Research 2",
         "desc": "With regards to the previous question, this list presents all current partners. You have the choice to select/deselect companies listed below.",
         "typeId": 2
      },
      {
         "questionId": 1514,
         "name": "Ad Exposure and Measurement 2",
         "desc": "With regards to the previous question, this list presents all current partners. You have the choice to select/deselect companies listed below.",
         "typeId": 2
      },
      {
         "questionId": 1515,
         "name": "Advertising Data Validation and Reporting 2",
         "desc": "With regards to the previous question, this list presents all current partners. You have the choice to select/deselect companies listed below.",
         "typeId": 2
      },
      {
         "questionId": 1516,
         "name": "Real World Advertising Research 2",
         "desc": "With regards to the previous question, this list presents all current partners. You have the choice to select/deselect companies listed below.",
         "typeId": 2
      },
      {
         "questionId": 1529,
         "name": "STANDARD_BUSINESS_DM",
         "desc": "When it comes to making business decisions, what role do you play?",
         "typeId": 1
      },
      {
         "questionId": 1542,
         "name": "HELTHCARE_MEDICAL_INDUSTERY",
         "desc": "Which of the following best describes your specific business operation in health care and medical industry?",
         "typeId": 2
      },
      {
         "questionId": 1549,
         "name": "STANDARD_AILMENTS_2_ADDICTION",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to addiction?",
         "typeId": 2
      },
      {
         "questionId": 1551,
         "name": "STANDARD_AILMENTS_2_VISION_HEARING",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Vision / Hearing Impairments?",
         "typeId": 2
      },
      {
         "questionId": 1552,
         "name": "STANDARD_AILMENTS_2_RESPIRATORY",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Allergy / Asthma / Respiratory?",
         "typeId": 2
      },
      {
         "questionId": 1553,
         "name": "STANDARD_AILMENTS_2_SLEEP",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Sleep Disorders?",
         "typeId": 2
      },
      {
         "questionId": 1558,
         "name": "STANDARD_AILMENTS_2_ARTHRITIS",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Arthritis / Joint Ailments?",
         "typeId": 2
      },
      {
         "questionId": 1559,
         "name": "STANDARD_AILMENTS_2_SKIN",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Skin / Dermatologic?",
         "typeId": 2
      },
      {
         "questionId": 1560,
         "name": "STANDARD_AILMENTS_2_PAIN",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Pain (e.g. Fibromyalgia, Gout)?",
         "typeId": 2
      },
      {
         "questionId": 1561,
         "name": "STANDARD_AILMENTS_1",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following ailments or medical conditions?",
         "typeId": 2
      },
      {
         "questionId": 1562,
         "name": "STANDARD_AILMENTS_2_AUTOIMMUNE",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Autoimmune / Blood?",
         "typeId": 2
      },
      {
         "questionId": 1563,
         "name": "STANDARD_AILMENTS_2_NEURO",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Neurologic / Nervous (e.g. Migraines, MS, Stroke)?",
         "typeId": 2
      },
      {
         "questionId": 1564,
         "name": "STANDARD_AILMENTS_2_CANCER",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Cancer?",
         "typeId": 2
      },
      {
         "questionId": 1565,
         "name": "STANDARD_AILMENTS_2_CARDIOVASCULAR",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Cardiovascular / Heart?",
         "typeId": 2
      },
      {
         "questionId": 1566,
         "name": "STANDARD_AILMENTS_2_MENTAL_HEALTH",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Mental Health (e.g. Anxiety, ADD/ADHD, Depression)?",
         "typeId": 2
      },
      {
         "questionId": 1567,
         "name": "STANDARD_AILMENTS_2_DENTAL",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Dental?",
         "typeId": 2
      },
      {
         "questionId": 1568,
         "name": "STANDARD_AILMENTS_2_MALE_FEMALE",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Male / Female Health (e.g. ED, Low T, Menopause, Osteoporosis)?",
         "typeId": 2
      },
      {
         "questionId": 1569,
         "name": "STANDARD_AILMENTS_2_GASTRIC",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Gastric / Digestive / Urinary (e.g. Crohn's, Heartburn, Kidney Disease)?",
         "typeId": 2
      },
      {
         "questionId": 1570,
         "name": "STANDARD_AILMENTS_2_DIABETES",
         "desc": "Have you, or someone for whom you provide care, been diagnosed with any of the following medical conditions related to Diabetes / Thyroid / Obesity?",
         "typeId": 2
      },
      {
         "questionId": 1599,
         "name": "STANDARD_PROFESSIONAL_TITLE",
         "desc": "What is your primary role in your organization?",
         "typeId": 1
      },
      {
         "questionId": 1600,
         "name": "STANDARD_HOUSEHOLD_DECISION_MAKER",
         "desc": "Are you a decision maker in your household regarding any of the following? Please select all that apply.",
         "typeId": 2
      },
      {
         "questionId": 1613,
         "name": "STANDARD_NUMBER_OF_AUTOMOBILE",
         "desc": "How many automotive vehicles (including cars, trucks, SUVs, motorcycles, mopeds, electronic vehicles and motorbikes) does your household currently own?",
         "typeId": 1
      },
      {
         "questionId": 1650,
         "name": "STANDARD_Business_Own_Operate",
         "desc": "Which of the following best describes the type of business you own or operate?",
         "typeId": 1
      },
      {
         "questionId": 1656,
         "name": "STANDARD_COUNTRY_OF_BIRTH",
         "desc": "What country were you born in?",
         "typeId": 1
      },
      {
         "questionId": 0,
         "name": "standard_organisation_revenue",
         "desc": "Approximately what is the annual revenue for your organization?",
         "typeId": 1
      },
      {
         "questionId": 0,
         "name": "business_department",
         "desc": "Which department do you primarily work within at your organization?",
         "typeId": 1
      },
      {
         "questionId": 0,
         "name": "business_purchase_decision",
         "desc": "Which of these products and services do you have direct influence over, in terms of purchase decisions within your workplace? Please select all that apply.",
         "typeId": 1
      }
   ]
}
]

module.exports = questionList;