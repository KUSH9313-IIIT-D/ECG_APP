const nodemailer = require('nodemailer');
    
    
let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'from.iiitd.ecg@gmail.com',
        pass: 'manish18156@iiitd.ac.in'
    }
});

module.exports = {
    sendOTP: function (Address,OTP,Name) {
        //// Send Mail Message
    let mailDetails = {
        from: 'from.iiitd.ecg@gmail.com',
        to: Address,
        subject: 'Your One Time Password.',
        text: `Hi ${Name},

        We just need to verify your email address before you can access IIITD ECG Service.
        
        Your One Time Password is ${OTP}.
        
        `
    };
    
    
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            //console.log('Email sent successfully');
        }
    });
    return OTP;
    },
    
    sendCreated: function (Address,Name,Password,Email) {
        //// Send Mail Message
    let mailDetails = {
        from: 'from.iiitd.ecg@gmail.com',
        to: Address,
        subject: 'Thanks For Signing Up.',
        text: `Hi ${Name},
	
	Your account is approved.
        
        Your Username/Email is ${Email}.
        
        Your Password is ${Password}.
        
        `
    };
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            //console.log('Email sent successfully');
        }
    });
    },
    
};
