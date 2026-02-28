/* ============================================ */
/* SOCIALSPARK - GAME LOGIC (LOCALSTORAGE ONLY) */
/* ============================================ */

// global state
var currentUser = null;
var currentTask = null;

// defined tasks per focus area
var tasksByFocus = {
    'Public Speaking': [
        { title: 'Speak up in a discussion', description: 'Say one thing during a group discussion today.' },
        { title: 'Ask a question', description: 'Ask at least one question in class or a meeting.' },
        { title: 'Introduce yourself confidently', description: 'Approach someone new and introduce yourself clearly.' },
        { title: 'Share an opinion', description: 'Offer your opinion in a conversation or group.' },
        { title: 'Practice aloud', description: 'Spend two minutes speaking aloud on any topic.' }
    ],
    'Casual Conversations': [
        { title: 'Talk to a stranger', description: 'Strike up a casual chat with someone you don\'t know.' },
        { title: 'Compliment someone', description: 'Give a genuine compliment to someone today.' },
        { title: 'Ask about their day', description: 'Ask a friend or coworker how their day is going and listen.' },
        { title: 'Share something personal', description: 'Open up to someone about a non-work topic.' },
        { title: 'Tell a short story', description: 'Tell someone a brief, interesting story.' }
    ],
    'Social Situations': [
        { title: 'Join a group', description: 'Join a group conversation and contribute.' },
        { title: 'Offer help', description: 'Offer assistance to someone in a social setting.' },
        { title: 'Start a plan', description: 'Suggest a meet-up or activity with friends.' },
        { title: 'Smile first', description: 'Approach someone with a friendly smile.' },
        { title: 'Apologize gracefully', description: 'Apologize sincerely if you\'ve made a small social mistake.' }
    ],
    'Handling Conflict': [
        { title: 'Listen fully', description: 'Hear someone out before responding during disagreement.' },
        { title: 'Stay calm', description: 'Respond calmly instead of reacting emotionally.' },
        { title: 'State your boundary', description: 'Clearly and respectfully state a personal boundary.' },
        { title: 'Seek common ground', description: 'Find something you agree on with someone who disagrees.' },
        { title: 'Thank feedback', description: 'Thank someone for giving you constructive criticism.' }
    ],
    'Professional Communication': [
        { title: 'Clarify an email', description: 'Send an email today that clearly states next steps.' },
        { title: 'Ask for feedback', description: 'Request feedback on a project or task.' },
        { title: 'Set a meeting goal', description: 'Enter a meeting with a clear objective and state it.' },
        { title: 'Follow up', description: 'Follow up on a request or promise professionally.' },
        { title: 'Praise a colleague', description: 'Give recognition to a coworker for their work.' }
    ]
};

// --------------------------------------------
// PAGE NAVIGATION
// --------------------------------------------
function showPage(pageId) {
    var pages = document.querySelectorAll('.page');
    pages.forEach(function(page) {
        page.style.display = 'none';
    });
    var target = document.getElementById(pageId);
    if (target) target.style.display = 'block';
    clearAllMessages();
}

// --------------------------------------------
// MESSAGE HANDLING
// --------------------------------------------
function showError(id, msg) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = msg;
        el.classList.add('show');
    }
}
function showSuccess(id, msg) {
    var el = document.getElementById(id);
    if (el) {
        el.textContent = msg;
        el.classList.add('show');
    }
}
function clearError(id) { var el = document.getElementById(id); if (el) {el.textContent=''; el.classList.remove('show'); }}
function clearSuccess(id){ var el=document.getElementById(id); if(el){el.textContent=''; el.classList.remove('show');}}
function clearAllMessages() {
    clearError('login-error');
    clearError('register-error');
    clearError('register-error');
    clearError('login-error');
    clearError('login-error');
    clearError('login-error');
    clearError('login-error');
    clearSuccess('login-success');
    clearSuccess('register-success');
}

// --------------------------------------------
// AUTHENTICATION
// --------------------------------------------
function handleRegister(event) {
    event.preventDefault();
    clearAllMessages();
    var username = document.getElementById('register-username').value.trim();
    var email = document.getElementById('register-email').value.trim();
    var pwd = document.getElementById('register-password').value.trim();
    var pwd2 = document.getElementById('register-password-confirm').value.trim();
    if (!username || !email || !pwd || !pwd2) { showError('register-error','Please fill in all fields'); return; }
    if (pwd !== pwd2) { showError('register-error','Passwords do not match'); return; }
    if (pwd.length < 6) { showError('register-error','Password must be at least 6 characters long'); return; }
    var users = JSON.parse(localStorage.getItem('socialspark_users')||'[]');
    if (users.some(u=>u.email===email)) { showError('register-error','Email address is already registered'); return; }
    if (users.some(u=>u.username===username)) { showError('register-error','Username is already taken'); return; }
    var newUser={id:Date.now().toString(),username:username,email:email,password:pwd,createdAt:new Date().toISOString()};
    users.push(newUser);
    localStorage.setItem('socialspark_users',JSON.stringify(users));
    showSuccess('register-success','Account created! Redirecting to login...');
    document.querySelector('#register-page form').reset();
    setTimeout(function(){showPage('login-page');},1500);
}

function handleLogin(event) {
    event.preventDefault();
    clearAllMessages();
    var email = document.getElementById('login-email').value.trim();
    var pwd = document.getElementById('login-password').value.trim();
    if (!email||!pwd) { showError('login-error','Please fill in all fields'); return; }
    var users = JSON.parse(localStorage.getItem('socialspark_users')||'[]');
    var user = users.find(u=>u.email===email);
    if (!user) { showError('login-error','Email address not found'); return; }
    if (user.password !== pwd) { showError('login-error','Incorrect password'); return; }
    currentUser = user;
    localStorage.setItem('socialspark_current_user',JSON.stringify(user));
    showSuccess('login-success','Login successful!');
    document.querySelector('#login-page form').reset();
    setTimeout(function(){
        var focus = localStorage.getItem('socialspark_focusArea');
        if (!focus) { showPage('assessment-page'); }
        else { showPage('dashboard-page'); updateDashboard(); }
    },1000);
}

// --------------------------------------------
// ASSESSMENT & ONBOARDING
// --------------------------------------------
function submitAssessment() {
    var score=0;
    for (var q=1;q<=5;q++){
        var radios=document.getElementsByName('q'+q);
        for(var j=0;j<radios.length;j++){ if(radios[j].checked){ score+=parseInt(radios[j].value); break; }}
    }
    // determine starting level
    var level;
    if (score<=10) level=1;
    else if (score<=20) level=2;
    else level=3;
    localStorage.setItem('socialspark_level', level);
    localStorage.setItem('socialspark_totalXP', score);
    localStorage.setItem('socialspark_currentXP', 0);
    localStorage.setItem('socialspark_streak', 0);
    localStorage.setItem('socialspark_freeze', 0);
    localStorage.setItem('socialspark_lastActivityDate','');
    localStorage.setItem('socialspark_reflections','[]');
    showPage('focus-page');
}

function selectFocus(area) {
    localStorage.setItem('socialspark_focusArea', area);
    updateDashboard();
    showPage('dashboard-page');
}

// --------------------------------------------
// TASK ENGINE
// --------------------------------------------
function loadTask() {
    var focus = localStorage.getItem('socialspark_focusArea');
    if (!focus) { showPage('focus-page'); return; }
    var arr = tasksByFocus[focus] || [];
    if (arr.length===0){ alert('No tasks defined for '+focus); return; }
    var idx = Math.floor(Math.random()*arr.length);
    currentTask = arr[idx];
    document.getElementById('task-title').textContent = currentTask.title;
    document.getElementById('task-desc').textContent = currentTask.description;
    document.getElementById('encourage-msg').textContent = 'You got this!';
    showPage('task-page');
}

function completeTask() {
    awardXP(20);
    updateStreak();
    showPage('reflection-page');
}

// --------------------------------------------
// REFLECTION
// --------------------------------------------
function saveReflection() {
    var conf = parseInt(document.querySelector('input[name="confidence"]:checked')?.value||0);
    var learn = document.getElementById('learning-text').value.trim();
    if (conf===0||learn==='') { alert('Please complete both fields.'); return; }
    var reflection = {
        date: new Date().toISOString(),
        focusArea: localStorage.getItem('socialspark_focusArea')||'',
        task: currentTask?currentTask.title:'',
        confidence: conf,
        learning: learn
    };
    var arr = JSON.parse(localStorage.getItem('socialspark_reflections')||'[]');
    arr.push(reflection);
    localStorage.setItem('socialspark_reflections',JSON.stringify(arr));
    awardXP(5);
    showPage('dashboard-page');
    updateDashboard();
}

// --------------------------------------------
// XP & LEVEL
// --------------------------------------------
function awardXP(amount) {
    var total = parseInt(localStorage.getItem('socialspark_totalXP')||0);
    var current = parseInt(localStorage.getItem('socialspark_currentXP')||0);
    var level = parseInt(localStorage.getItem('socialspark_level')||1);
    total += amount;
    current += amount;
    if (current >= 100) {
        var gained = Math.floor(current/100);
        level += gained;
        current = current % 100;
        showLevelUpCelebration(level);
    }
    localStorage.setItem('socialspark_totalXP', total);
    localStorage.setItem('socialspark_currentXP', current);
    localStorage.setItem('socialspark_level', level);
    updateXPBar();
    showXPFloatAnimation(amount);
}

function updateXPBar() {
    var current = parseInt(localStorage.getItem('socialspark_currentXP')||0);
    var percent = (current/100)*100;
    document.getElementById('xp-bar-fill').style.width = percent + '%';
    document.getElementById('xp-current').textContent = current + ' / 100';
}

function showLevelUpCelebration(newLevel) {
    var modal = document.createElement('div');
    modal.className = 'level-up-modal';
    var title = 'Level ' + newLevel;
    var confetti = '';
    for (var i=0;i<50;i++){
        confetti += '<div class="confetti" style="left:' + Math.random()*100 + '%; --delay:' + (Math.random()*0.5) + 's;"></div>';
    }
    modal.innerHTML = '<div class="level-up-content">' +
        '<div class="confetti-container">' + confetti + '</div>' +
        '<h2>🎉 Level Up!</h2>' +
        '<p class="level-number">' + newLevel + '</p>' +
        '<button class="btn btn-primary" onclick="closeLevelUpModal()">Continue</button>' +
        '</div>';
    document.body.appendChild(modal);
}
function closeLevelUpModal(){
    var m=document.querySelector('.level-up-modal');
    if(m){m.classList.add('fade-out');setTimeout(function(){m.remove();},300);} }

function showXPFloatAnimation(amount) {
    var floating = document.createElement('div');
    floating.className = 'xp-float';
    floating.textContent = '+' + amount + ' XP';
    document.body.appendChild(floating);
    setTimeout(function(){ floating.remove(); },2000);
}

// --------------------------------------------
// STREAK HANDLING
// --------------------------------------------
function updateStreak() {
    var today = formatDate(new Date());
    var last = localStorage.getItem('socialspark_lastActivityDate')||'';
    var streak = parseInt(localStorage.getItem('socialspark_streak')||0);
    var freeze = parseInt(localStorage.getItem('socialspark_freeze')||0);
    if (last===today) return;
    var yesterday = formatDate(new Date(Date.now()-86400000));
    if (last===yesterday){
        streak++;
        if (streak %7===0){ freeze++; alert('🎉 7 day streak! You earned a freeze token!'); }
    } else {
        if (freeze>0){ freeze--; }
        else { streak=1; }
    }
    localStorage.setItem('socialspark_streak', streak);
    localStorage.setItem('socialspark_freeze', freeze);
    localStorage.setItem('socialspark_lastActivityDate', today);
    updateDashboard();
}

// --------------------------------------------
// DASHBOARD UPDATE
// --------------------------------------------
function updateDashboard() {
    var level = parseInt(localStorage.getItem('socialspark_level')||1);
    var total = parseInt(localStorage.getItem('socialspark_totalXP')||0);
    var streak = parseInt(localStorage.getItem('socialspark_streak')||0);
    var freeze = parseInt(localStorage.getItem('socialspark_freeze')||0);
    var focus = localStorage.getItem('socialspark_focusArea')||'None';
    document.getElementById('dashboard-level').textContent = level;
    document.getElementById('dashboard-totalxp').textContent = total;
    document.getElementById('dashboard-streak').textContent = streak + ' 🔥';
    document.getElementById('dashboard-freeze').textContent = freeze;
    document.getElementById('dashboard-focus').textContent = focus;
    updateXPBar();
}

// --------------------------------------------
// UTILITIES
// --------------------------------------------
function formatDate(d){
    var y=d.getFullYear();
    var m=('0'+(d.getMonth()+1)).slice(-2);
    var day=('0'+d.getDate()).slice(-2);
    return y+'-'+m+'-'+day;
}

function ensureBaseStats(){
    if (!localStorage.getItem('socialspark_totalXP')) localStorage.setItem('socialspark_totalXP','0');
    if (!localStorage.getItem('socialspark_currentXP')) localStorage.setItem('socialspark_currentXP','0');
    if (!localStorage.getItem('socialspark_level')) localStorage.setItem('socialspark_level','1');
    if (!localStorage.getItem('socialspark_streak')) localStorage.setItem('socialspark_streak','0');
    if (!localStorage.getItem('socialspark_freeze')) localStorage.setItem('socialspark_freeze','0');
    if (!localStorage.getItem('socialspark_lastActivityDate')) localStorage.setItem('socialspark_lastActivityDate','');
    if (!localStorage.getItem('socialspark_reflections')) localStorage.setItem('socialspark_reflections','[]');
}

// --------------------------------------------
// INITIALIZATION
// --------------------------------------------
function initApp(){
    var u = localStorage.getItem('socialspark_current_user');
    if (!u){ showPage('welcome-page'); return; }
    currentUser = JSON.parse(u);
    ensureBaseStats();
    var focus = localStorage.getItem('socialspark_focusArea');
    if (!focus){ showPage('assessment-page'); }
    else { showPage('dashboard-page'); updateDashboard(); }
}

window.addEventListener('load', initApp);
