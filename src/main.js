/* =============================================
   VINO STUDIO — 交互逻辑
   ============================================= */
import './style.css';
import { initI18n, t } from './i18n/i18n.js';

/* ---------- 初始化 EmailJS ---------- */
(function() {
  // 注意：此处 PUBLIC_KEY 为占位符，用户需自行替换或在 EmailJS 控制台配置
  // 也可以通过初始化时不传参数，在发送时指定
  emailjs.init({
    publicKey: "BN85SkDZO8U5aUTOD",
  });
})();

/* ---------- 导航栏滚动效果 ---------- */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

// 滚动时添加背景
function handleNavbarScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// 高亮当前区域的导航链接
function updateActiveLink() {
  const scrollPosition = window.scrollY + 150;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', () => {
  handleNavbarScroll();
  updateActiveLink();
}, { passive: true });

/* ---------- 移动端汉堡菜单 ---------- */
const navBurger = document.getElementById('navBurger');
const navLinksContainer = document.getElementById('navLinks');

navBurger.addEventListener('click', () => {
  navBurger.classList.toggle('open');
  document.body.classList.toggle('mobile-menu-open');
});

// 点击移动端导航链接后关闭菜单
navLinksContainer.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    navBurger.classList.remove('open');
    document.body.classList.remove('mobile-menu-open');
  });
});

/* ---------- 滚动进入动画（Intersection Observer） ---------- */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 触发后不再观察，提升性能
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* ---------- 数字计数器动画 ---------- */
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

statNumbers.forEach((el) => counterObserver.observe(el));

function animateCounter(element) {
  const target = parseInt(element.dataset.target, 10);
  const duration = 2000; // 动画持续时间（毫秒）
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // 使用 easeOutExpo 缓动函数
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(eased * target);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ---------- 平滑锚点滚动 ---------- */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

/* ---------- 回到顶部按钮 ---------- */
const backToTop = document.getElementById('backToTop');

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- 联系表单处理 ---------- */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData.entries());

    // 简单验证（使用 i18n 翻译的消息）
    if (!data.email || !data.message) {
      showFormMessage(t('contact.form.errorRequired'), 'error');
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      showFormMessage(t('contact.form.errorEmail'), 'error');
      return;
    }

    // 真实邮件提交 (使用 EmailJS)
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const textSpan = submitBtn.querySelector('.i18n-text');
    if (textSpan) textSpan.textContent = t('contact.form.submitting');
    submitBtn.disabled = true;

    // 参数说明：service_id, template_id, form_element
    // 用户需要替换为您真实的 Service ID 和 Template ID
    emailjs.sendForm('service_i14joej', 'template_wcweqgh', contactForm)
      .then(() => {
        showFormMessage(t('contact.form.success'), 'success');
        contactForm.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        showFormMessage(t('contact.form.errorGeneral') || 'Failed to send message.', 'error');
      })
      .finally(() => {
        if (textSpan) textSpan.textContent = t('contact.form.submit');
        submitBtn.disabled = false;
      });
  });
}

function showFormMessage(text, type) {
  // 移除已有的消息
  const existingMsg = document.querySelector('.form-message');
  if (existingMsg) existingMsg.remove();

  const msgEl = document.createElement('div');
  msgEl.className = `form-message form-message--${type}`;
  msgEl.textContent = text;
  msgEl.style.cssText = `
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-top: 8px;
    animation: fadeIn 0.3s ease;
    ${type === 'success'
      ? 'background: rgba(76, 175, 80, 0.15); color: #81c784; border: 1px solid rgba(76, 175, 80, 0.3);'
      : 'background: rgba(244, 67, 54, 0.15); color: #ef9a9a; border: 1px solid rgba(244, 67, 54, 0.3);'
    }
  `;

  contactForm.appendChild(msgEl);

  // 3 秒后自动消失
  setTimeout(() => {
    msgEl.style.opacity = '0';
    msgEl.style.transition = 'opacity 0.3s ease';
    setTimeout(() => msgEl.remove(), 300);
  }, 3000);
}

/* ---------- 导航链接平滑高亮过渡 ---------- */
// 页面加载后立即检查
handleNavbarScroll();
updateActiveLink();

// 初始触发可见元素的动画（针对首屏内容）
setTimeout(() => {
  revealElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    }
  });
}, 100);

/* ---------- 初始化多语言系统 ---------- */
initI18n();
