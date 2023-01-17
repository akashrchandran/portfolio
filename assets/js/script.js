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

// JQuery for Certificates' Section
$('.carousel').on('touchstart', function(event){
    const xClick = event.originalEvent.touches[0].pageX;
    $(this).one('touchmove', function(event){
        const xMove = event.originalEvent.touches[0].pageX;
        const sensitivityInPx = 5;

        if( Math.floor(xClick - xMove) > sensitivityInPx ){
            $(this).carousel('next');
        }
        else if( Math.floor(xClick - xMove) < -sensitivityInPx ){
            $(this).carousel('prev');
        }
    });
    $(this).on('touchend', function(){
        $(this).off('touchmove');
    });
});

$('#contact-form').submit((e)=>{
    e.preventDefault();
})

// Send Email func, should have used fetch but jquery seems to be nice
emailbutton = document.getElementById('sendmail');
emailinfo = document.getElementById('form-info');
function sendEmail() {
    const response = grecaptcha.getResponse();
    if (!response) {
        emailinfo.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please verify the captcha';
        return;
    }
    else {
        emailinfo.innerHTML = '';
    }
    emailbutton.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Loading...';
    emailbutton.classList.add("disabled_def");
    const name = document.getElementById("form-name");
    const phone = document.getElementById("form-phone");
    const email = document.getElementById("form-email");
    const message = document.getElementById("form-message");
    var data = {
        service_id: 'service_9fnrphq',
        template_id: 'template_ie65z47',
        user_id: 'XCfDptyHXB-M91Vj3',
        template_params: {
            name: name.value,
            email: email.value,
            phone: phone.value,
            message: message.value,
            'g-recaptcha-response': response
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
flag=0;
window.addEventListener('scroll', () => {
    const sectionPos = skillSection.getBoundingClientRect().top;
    const screenPos = window.innerHeight/2;


    if(sectionPos < screenPos && !flag){
        showProgress();
        flag=1;
    }
    else{
        if(!flag)
            hideProgress();
    }
});


// Change dark or light icon
const faviconTag = document.getElementById("faviconid");
const isDark = window.matchMedia("(prefers-color-scheme: dark)");
const changeFavicon = () => {
    if (isDark.matches) faviconTag.href = "assets/image/light_logo.svg";
    else faviconTag.href = "assets/image/dark_logo.svg";
  };
setInterval(changeFavicon, 1000);