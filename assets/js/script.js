$(window).on("load", function(){
    $('#loader_wrapper').fadeOut('slow');
});
// Header Scroll
let nav = document.querySelector(".navbar");
$( window ).scroll(function () {
    if(document.documentElement.scrollTop > 20){
        nav.classList.add("header-scrolled");
    }else{
        nav.classList.remove("header-scrolled");
    }
} 
)

// nav hide 
let navBar = document.querySelectorAll(".nav-link");
let navCollapse = document.querySelector(".navbar-collapse.collapse");
navBar.forEach(function (a){
    a.addEventListener("click", function(){
        navCollapse.classList.remove("show");
    })
})

/// Year retriver
document.getElementById("year").innerHTML = (new Date().getFullYear());


// typing animation\
var options = {
    strings: ['Web Developer.', 'Student.', 'Tech Enthusiast.'],
    typeSpeed: 150,
    backSpeed: 150,
    loop: true,
};

var typed = new Typed('.typerjs', options);


// Send Email func, should have used fetch but jquery seems to be nice
emailbutton = document.getElementById('sendmail');
function sendEmail() {
    emailbutton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Loading...';
    emailbutton.classList.add("disabled_def");
    const name = document.getElementById("form-name");
    const phone = document.getElementById("form-phone");
    const email = document.getElementById("form-email");
    const message = document.getElementById("form-message");
    console.log(!name.value, !email.value, !message.value)
    if (!name.value || !email.value || !message.value) {
        emailbutton.style = "background: red";
        emailbutton.innerHTML = '<i class="fa fa-times"></i> Failed';
        setTimeout(location.reload.bind(location), 2000);

    }
    else {
        var data = {
            service_id: 'service_9fnrphq',
            template_id: 'template_ie65z47',
            user_id: 'XCfDptyHXB-M91Vj3',
            template_params: {
                name: name.value,
                email: email.value,
                phone: phone.value,
                message: message.value,
            }
        };
        emailbutton.style = "cursor: pointer; pointer-events: none;";
        $.ajax('https://api.emailjs.com/api/v1.0/email/send', {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json'
        }).done(function () {
            emailbutton.innerHTML = '<i class="fa fa-check"></i> Sent';
            emailbutton.style = "background: green";
            setTimeout(location.reload.bind(location), 2000);
        }).fail(function (error) {
            emailbutton.innerHTML = '<i class="fa fa-times"></i> Failed';
            emailbutton.style = "background: red";
            setTimeout(location.reload.bind(location), 2000);
        });
    }
}

// Scroll to top
let mybutton = document.getElementById("btn-back-to-top");
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20
  ) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}
mybutton.addEventListener("click", backToTop);

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// // {
// //     var i = 0;
// //     var bar = document.querySelector(".progress-bar1");
// //         function makeProgress(){
// //             if(i < 90){
// //                 i = i + 0.25;
// //               	bar.style.width = i + "%";
// //               	//bar.innerText = i + "%";
// //             }

// //             // Wait for sometime before running this script again
// //             setTimeout("makeProgress()", 10);

// //         }
// //         makeProgress();
// //     }   
// {var j = 0;
//       	var bar1 = document.querySelector(".progress-bar2")
//         function makeProgress1(){
//             if(j < 75){
//                 j = j + 0.25;
//               	bar1.style.width = j + "%";
//               	//bar.innerText = i + "%";
//             }

//             // Wait for sometime before running this script again
//             setTimeout("makeProgress1()", 10);
//         }
//         makeProgress1();
//     }
// {var a = 0;
//       	var bar2 = document.querySelector(".progress-bar3")
//         function makeProgress2(){
//             if(a < 60){
//                 a = a + 0.25;
//               	bar2.style.width = a + "%";
//               	//bar.innerText = i + "%";
//             }

//             // Wait for sometime before running this script again
//             setTimeout("makeProgress2()", 10);
//         }
//         makeProgress2();
//     }
// {var b = 0;
//       	var bar3 = document.querySelector(".progress-bar4")
//         function makeProgress3(){
//             if(b < 60){
//                 b = b + 0.25;
//               	bar3.style.width = b + "%";
//               	//bar.innerText = i + "%";
//             }

//             // Wait for sometime before running this script again
//             setTimeout("makeProgress3()", 10);
//         }
//         makeProgress3();
//     }
// {var c = 0;
//       	var bar4 = document.querySelector(".progress-bar5")
//         function makeProgress4(){
//             if(c < 25){
//                 c = c + 0.25;
//               	bar4.style.width = c + "%";
//               	//bar.innerText = i + "%";
//             }

//             // Wait for sometime before running this script again
//             setTimeout("makeProgress4()", 10);
//         }
//         makeProgress4();
//     }
// {var d = 0;
//       	var bar5 = document.querySelector(".progress-bar6")
//         function makeProgress5(){
//             if(d < 90){
//                 d = d + 0.25;
//               	bar5.style.width = d + "%";
//               	//bar.innerText = i + "%";
//             }

//             // Wait for sometime before running this script again
//             setTimeout("makeProgress5()", 10);
//         }
//         makeProgress5();
//     }
// {var e = 0;
//       	var bar6 = document.querySelector(".progress-bar7")
//         function makeProgress6(){
//             if(e < 75){
//                 e = e + 0.25;
//               	bar6.style.width = e + "%";
//               	//bar.innerText = i + "%";
//             }

//             // Wait for sometime before running this script again
//             setTimeout("makeProgress6()", 10);
//         }
//         makeProgress6();
//     }
// {var f = 0;
//       	var bar7 = document.querySelector(".progress-bar8")
//         function makeProgress7(){
//             if(f < 40){
//                 f = f + 0.25;
//               	bar7.style.width = f + "%";
//               	//bar.innerText = i + "%";
//             }

//             // Wait for sometime before running this script again
//             setTimeout("makeProgress7()", 10);
//         }
//         makeProgress7();
//     }

//     let skils = document.getElementById(".nav-link");

//         skils.addEventListener("click", RestartProgressBar);
//         function RestartProgressBar(){
//             if(skils.textContent === "Skills" ){
//                 i = 0;
//                 makeProgress();
//             }
//         }
    
        
const skillSection = document.getElementById('pills-skill-tab');
const progressBars = document.querySelectorAll('.progress-bar');

function showProgress() {
    progressBars.forEach(progressBar => {
        const value = progressBar.dataset.progress;
        progressBar.style.opacity = 1;
        progressBar.style.width = `${value}%`;
    });
}

function hideProgress(){
    progressBars.forEach(p => {
        p.style.opacity = 0;
        p.style.width = 0;

});

}

window.addEventListener('scroll', () => {
    const sectionPos = skillSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight/2;


    if(sectionPos < screenPos){
        showProgress();}
        else{
            hideProgress();
        }
});
