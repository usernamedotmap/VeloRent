import { checkCredits, sendSms } from "../config/Iprogsms";



const test = async () => {

    const credits = await checkCredits();
      console.log('Credits remaining:', credits);

      const result = await sendSms('09566312911', 'Velorent test Sms');
      console.log('SMS send result:', result);
};

test().catch(console.error);