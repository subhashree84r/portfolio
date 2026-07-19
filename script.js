// Initialize Icons
lucide.createIcons();

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDPd2hgD1B0wAu0-CxxkpdPxAQD0fj4niE",
  authDomain: "dollyportfolio.firebaseapp.com",
  projectId: "dollyportfolio",
  storageBucket: "dollyportfolio.firebasestorage.app",
  messagingSenderId: "705233839815",
  appId: "1:705233839815:web:09c4801d29bc1adbf000e2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentEditingProjectId = null;
let currentEditingSkillId = null;
let currentEditingCertId = null;

let isAdmin = false;

// --- Toast & Confirm Delete Logic ---
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msg = document.getElementById('toastMessage');
  if(toast && msg) {
    msg.innerText = message;
    toast.classList.add('show');
    lucide.createIcons();
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

let pendingDeleteAction = null;
function showConfirmDelete(message, onConfirm) {
  const textEl = document.getElementById('confirmDeleteText');
  if(textEl) textEl.innerText = message;
  pendingDeleteAction = onConfirm;
  
  const modal = document.getElementById('confirmDeleteModal');
  if(modal) {
    modal.classList.add('active');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
  }
}

function hideConfirmDelete() {
  pendingDeleteAction = null;
  const modal = document.getElementById('confirmDeleteModal');
  if(modal) {
    modal.classList.remove('active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cancelBtn = document.getElementById('cancelDeleteBtn');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if(cancelBtn) cancelBtn.addEventListener('click', hideConfirmDelete);
  if(confirmBtn) confirmBtn.addEventListener('click', () => {
    if(pendingDeleteAction) pendingDeleteAction();
    hideConfirmDelete();
  });
});
// -------------------------------------

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    isAdmin = true;
    updateEditModeUI(true);
  } else {
    isAdmin = false;
    updateEditModeUI(false);
  }
});

// Edit Mode UI Toggle
function updateEditModeUI(active) {
  const editModeBtn = document.getElementById('editModeBtn');
  if (active) {
    if(editModeBtn) {
      editModeBtn.innerHTML = `<span><i data-lucide="log-out"></i> Exit Edit Mode</span><i data-lucide="chevron-right"></i>`;
      lucide.createIcons();
    }
    document.body.classList.add('admin-mode');
  } else {
    if(editModeBtn) {
      editModeBtn.innerHTML = `<span><i data-lucide="settings-2"></i> Edit Portfolio</span><i data-lucide="chevron-right"></i>`;
      lucide.createIcons();
    }
    document.body.classList.remove('admin-mode');
  }
  
  if (typeof loadSkills === 'function') {
    loadSkills(); // Refresh skills to show/hide admin controls
  }
}

// --- Profile Popup Logic ---
const profileBtn = document.getElementById("profileToggle");
const profilePopup = document.getElementById("profilePopup");

profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  profilePopup.classList.toggle("active");
  // Close mobile menu if open
  mobileMenu.classList.remove("active");
  updateMobileIcon(false);
});

// --- Theme Toggle Logic ---
const themeToggleCheckbox = document.getElementById("themeToggleCheckbox");
const themeText = document.getElementById("themeText");
const htmlElement = document.documentElement;

// Initialize Theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  htmlElement.setAttribute("data-theme", "dark");
  themeToggleCheckbox.checked = true;
  themeText.textContent = "Dark Mode";
} else {
  htmlElement.setAttribute("data-theme", "light");
  themeToggleCheckbox.checked = false;
  themeText.textContent = "Light Mode";
}

themeToggleCheckbox.addEventListener("change", (e) => {
  if (e.target.checked) {
    htmlElement.setAttribute("data-theme", "dark");
    themeText.textContent = "Dark Mode";
    localStorage.setItem("theme", "dark");
  } else {
    htmlElement.setAttribute("data-theme", "light");
    themeText.textContent = "Light Mode";
    localStorage.setItem("theme", "light");
  }
});

// --- Mobile Navigation Logic ---
const mobileNavToggle = document.getElementById("mobileNavToggle");
const mobileMenu = document.getElementById("mobileMenu");
let isMobileMenuOpen = false;

function updateMobileIcon(isOpen) {
  isMobileMenuOpen = isOpen;
  mobileNavToggle.innerHTML = isOpen
    ? '<i data-lucide="x"></i>'
    : '<i data-lucide="menu"></i>';
  lucide.createIcons();
}

mobileNavToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle("active");
  updateMobileIcon(mobileMenu.classList.contains("active"));
  // Close profile if open
  profilePopup.classList.remove("active");
});

// Close popups when clicking outside
document.addEventListener("click", (e) => {
  if (!profilePopup.contains(e.target) && e.target !== profileBtn) {
    profilePopup.classList.remove("active");
  }
  if (!mobileMenu.contains(e.target) && e.target !== mobileNavToggle) {
    mobileMenu.classList.remove("active");
    updateMobileIcon(false);
  }
});

// Close mobile menu when clicking a link
const mobileLinks = document.querySelectorAll(".mobile-item");
mobileLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    updateMobileIcon(false);
  });
});

// --- Scroll Spy Logic (For Desktop Dock & Mobile Menu) ---
const sections = document.querySelectorAll("section");
const dockItems = document.querySelectorAll(".dock-item");
const mobileItems = document.querySelectorAll(".mobile-item");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    // Offset by 1/3 of the section height to trigger smoothly
    if (pageYOffset >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute("id");
    }
  });

  // Update Desktop Dock
  dockItems.forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("href").substring(1) === current) {
      item.classList.add("active");
    }
  });

  // Update Mobile Menu
  mobileItems.forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("href").substring(1) === current) {
      item.classList.add("active");
    }
  });

});

// --- Tech Stack Filtering & Firebase Logic ---
const filterBtns = document.querySelectorAll('.filter-btn');
const techGrid = document.querySelector('.tech-grid');

function applyTechFilter() {
  const activeBtn = document.querySelector('.filter-btn.active');
  const filterValue = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
  const techItems = document.querySelectorAll('.tech-item:not(.add-skill-btn)');
  const addBtn = document.querySelector('.add-skill-btn');
  
  if (addBtn) {
    if (filterValue === 'all') {
      addBtn.style.display = ''; // relies on css flex/none based on admin-mode
    } else {
      addBtn.style.display = 'none';
    }
  }
  
  techItems.forEach(item => {
    if (filterValue === 'all') {
      item.style.display = 'flex';
    } else {
      const categories = item.getAttribute('data-category');
      if (categories && categories.includes(filterValue)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    }
  });
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyTechFilter();
  });
});

let skillsUnsubscribe = null;

async function migrateSkillsIfEmpty() {
  const snapshot = await db.collection('skills').get();
  if (snapshot.empty) {
    const defaultSkills = [
      { name: "HTML5", category: "frontend", iconHTML: '<div class="tech-html">5</div>', order: 1 },
      { name: "CSS3", category: "frontend", iconHTML: '<div class="tech-css">3</div>', order: 2 },
      { name: "JavaScript", category: "frontend backend", iconHTML: '<div class="tech-js">JS</div>', order: 3 },
      { name: "Python", category: "backend", iconHTML: '<i data-lucide="terminal"></i>', order: 4 },
      { name: "VB.NET", category: "backend", iconHTML: '<i data-lucide="monitor"></i>', order: 5 },
      { name: "SQL", category: "database", iconHTML: '<i data-lucide="database"></i>', order: 6 },
      { name: "Firebase", category: "database", iconHTML: '<i data-lucide="flame"></i>', order: 7 },
      { name: "Git/GitHub", category: "tools", iconHTML: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>', order: 8 }
    ];
    for (let skill of defaultSkills) {
      await db.collection('skills').add(skill);
    }
  }
}

function loadSkills() {
  if (skillsUnsubscribe) skillsUnsubscribe();
  
  skillsUnsubscribe = db.collection('skills').orderBy('order', 'asc').onSnapshot(snapshot => {
    if(techGrid) techGrid.innerHTML = '';
    
    if (isAdmin && techGrid) {
      const addCard = document.createElement('div');
      addCard.className = 'tech-item add-skill-btn admin-only';
      addCard.innerHTML = '<i data-lucide="plus"></i> <span>Add Skill</span>';
      addCard.addEventListener('click', () => {
        document.getElementById('addSkillModalTitle').innerText = 'Add New Skill';
        document.getElementById('addSkillBtn').innerHTML = 'Add Skill <i data-lucide="plus"></i>';
        document.getElementById('addSkillForm').reset();
        currentEditingSkillId = null;
        
        document.getElementById('addSkillModal').classList.add('active');
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
        history.pushState({ modal: true }, '', '');
        isModalOpen = true;
      });
      techGrid.appendChild(addCard);
    }

    snapshot.forEach(doc => {
      const skill = doc.data();
      const div = document.createElement('div');
      div.className = 'tech-item';
      div.setAttribute('data-category', skill.category);
      div.innerHTML = `
        ${skill.iconHTML}
        ${skill.name}
        <button class="delete-skill-btn admin-only" data-id="${doc.id}"><i data-lucide="trash-2"></i></button>
        <button class="edit-skill-btn admin-only" style="position:absolute; top:-8px; right: 20px; background: #3498db; color:white; border:none; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:0; transition:opacity 0.2s; z-index:10;"><i data-lucide="edit-2" style="width:12px; height:12px;"></i></button>
      `;
      
      const delBtn = div.querySelector('.delete-skill-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showConfirmDelete(`Delete skill: ${skill.name}?`, () => {
            db.collection('skills').doc(doc.id).delete();
          });
        });
      }
      
      const editBtn = div.querySelector('.edit-skill-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentEditingSkillId = doc.id;
          document.getElementById('addSkillModalTitle').innerText = 'Edit Skill';
          document.getElementById('addSkillBtn').innerHTML = 'Update Skill <i data-lucide="edit-2"></i>';
          document.getElementById('skillName').value = skill.name;
          document.getElementById('skillCategory').value = skill.category;
          
          let iconVal = skill.iconHTML;
          if (iconVal.includes('<div style="color:')) {
            const match = iconVal.match(/>(.*?)<\/div>/);
            if (match) iconVal = match[1];
          }
          document.getElementById('skillIconHTML').value = iconVal;
          
          document.getElementById('addSkillModal').classList.add('active');
          document.documentElement.classList.add('no-scroll');
          document.body.classList.add('no-scroll');
          history.pushState({ modal: true }, '', '');
          isModalOpen = true;
          lucide.createIcons();
        });
      }
      if(techGrid) techGrid.appendChild(div);
    });

    document.querySelectorAll('.delete-skill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmDelete("Are you sure you want to delete this skill?", () => {
          db.collection('skills').doc(btn.getAttribute('data-id')).delete();
        });
      });
    });

    lucide.createIcons();
    applyTechFilter();
  });
}

const addSkillForm = document.getElementById('addSkillForm');
if(addSkillForm) {
  addSkillForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('addSkillBtn');
    btn.innerHTML = currentEditingSkillId ? 'Updating...' : 'Adding...';
    
    let iconInput = document.getElementById('skillIconHTML').value.trim();
    const isHTML = /<[a-z][\s\S]*>/i.test(iconInput);
    if (!isHTML) {
      const colors = ['#e34f26', '#1572b6', '#f7df1e', '#3178c6', '#61dafb', '#42b883', '#dd1b16', '#007acc', '#ff4d4d', '#9b59b6', '#3498db', '#e67e22', '#2ecc71', '#FF6B6B', '#4ECDC4'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      iconInput = `<div style="color: ${randomColor}; font-size: 24px; font-weight: bold; display: flex; align-items: center; justify-content: center;">${iconInput}</div>`;
    }

    if (currentEditingSkillId) {
      await db.collection('skills').doc(currentEditingSkillId).update({
        name: document.getElementById('skillName').value,
        category: document.getElementById('skillCategory').value,
        iconHTML: iconInput
      });
    } else {
      const newSkill = {
        name: document.getElementById('skillName').value,
        category: document.getElementById('skillCategory').value,
        iconHTML: iconInput,
        order: Date.now()
      };
      await db.collection('skills').add(newSkill);
    }
    
    addSkillForm.reset();
    handleModalClose();
    btn.innerHTML = 'Add Skill <i data-lucide="plus"></i>';
    currentEditingSkillId = null;
    lucide.createIcons();
  });
}

const closeAddSkillModalBtn = document.getElementById('closeAddSkillModalBtn');
const addSkillModal = document.getElementById('addSkillModal');
if(closeAddSkillModalBtn) closeAddSkillModalBtn.addEventListener('click', () => { handleModalClose(); });
if(addSkillModal) addSkillModal.addEventListener('click', (e) => {
  if (e.target === addSkillModal) handleModalClose();
});

migrateSkillsIfEmpty().then(loadSkills);

// --- Projects Carousel & Firebase Logic ---
const carouselWrapper = document.getElementById('carouselWrapper');
const carouselTrack = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let carouselCards = [];
let dots = [];
let currentIndex = 0;
let projectsUnsubscribe = null;

async function migrateProjectsIfEmpty() {
  const snapshot = await db.collection('projects').get();
  if (snapshot.empty) {
    const defaultProjects = [
      {
        title: "Exam Preparation Portal",
        images: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        tags: ["Python", "Firebase", "JS", "HTML", "CSS"],
        description: ["A comprehensive cloud-based platform designed for exam preparation.", "Organizes study materials efficiently with integrated video learning modules.", "Includes an intelligent AI chatbot to assist students with their queries in real-time.", "Built with a focus on scalable architecture and seamless user experience."],
        demoLink: "#", sourceLink: "#", order: 1
      },
      {
        title: "MIS Report Portal",
        images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        tags: ["Python", "Firebase", "JS", "Data Analysis"],
        description: ["Advanced Management Information System (MIS) portal dedicated to construction progress tracking.", "Automates the generation of Excel reports for streamlined data collection.", "Provides a centralized dashboard for real-time analytics and decision-making."],
        demoLink: "#", sourceLink: "#", order: 2
      },
      {
        title: "Portfolio Website",
        images: ["https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        tags: ["HTML5", "CSS3", "JS", "UI/UX"],
        description: ["A modern, highly interactive personal portfolio website.", "Features smooth scroll animations, a glassmorphism design system, and a dynamic project carousel.", "Serves as a digital resume showcasing skills, projects, and professional workflow.", "Built with an emphasis on performance and aesthetic appeal."],
        demoLink: "#", sourceLink: "#", order: 3
      },
      {
        title: "Zomato Clone",
        images: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        tags: ["HTML5", "CSS3", "Responsive Design"],
        description: ["A pixel-perfect, fully responsive clone of the Zomato landing page and restaurant listings.", "Accurately replicates the complex layout, search functionalities, and filtering options.", "Demonstrates strong proficiency in frontend styling and structural design."],
        demoLink: "#", sourceLink: "#", order: 4
      },
      {
        title: "Rapido Clone",
        images: ["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        tags: ["HTML5", "CSS3", "Animations"],
        description: ["A responsive clone replicating the Rapido booking interface.", "Focuses on smooth interactive effects and intuitive user flows.", "Implements mobile-first design principles to simulate a real-world ride-hailing app."],
        demoLink: "#", sourceLink: "#", order: 5
      },
      {
        title: "Knight Bite & Amma's",
        images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        tags: ["HTML5", "CSS3", "Branding"],
        description: ["Two complete, custom-developed food brand websites built from scratch.", "Feature engaging UI designs and appetizing visual layouts.", "Optimized performance to enhance online presence and customer engagement for local food businesses."],
        demoLink: "#", sourceLink: "#", order: 6
      },
      {
        title: "Cab Management System",
        images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        tags: ["Python", "Backend Logic"],
        description: ["A robust backend application designed to support driver allocation and booking management.", "Integrates complex fare calculation algorithms.", "Streamlines operations for cab services with efficient data handling and scalable architecture."],
        demoLink: "#", sourceLink: "#", order: 7
      },
      {
        title: "Library Management",
        images: ["https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"],
        tags: ["VB.NET", "SQL", "Desktop App"],
        description: ["A comprehensive desktop application built for library administration.", "Supports robust inventory management and seamless issue/return tracking.", "Includes detailed reporting functionalities, backed by a secure SQL database."],
        demoLink: "#", sourceLink: "#", order: 8
      }
    ];
    for (let project of defaultProjects) {
      await db.collection('projects').add(project);
    }
  }
}

let dotsContainer = document.getElementById('carouselDots');
if (!dotsContainer && carouselWrapper) {
  dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  dotsContainer.id = 'carouselDots';
  carouselWrapper.parentNode.insertBefore(dotsContainer, carouselWrapper.nextSibling);
}

function loadProjects() {
  if (projectsUnsubscribe) projectsUnsubscribe();
  
  projectsUnsubscribe = db.collection('projects').orderBy('order', 'asc').onSnapshot(snapshot => {
    if (!carouselTrack) return;
    carouselTrack.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';
    
    const openAddBtn = document.getElementById('openAddProjectModalBtn');
    if (openAddBtn) {
      openAddBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    
    let index = 0;
    snapshot.forEach(doc => {
      const project = doc.data();
      const card = document.createElement('div');
      card.className = `carousel-card ${index === 0 ? 'active-card' : ''}`;
      card.style.position = 'relative';
      
      const tagsHTML = (project.tags || []).map(tag => `<span class="ptag">${tag}</span>`).join('');
      const firstImg = (project.images && project.images.length > 0) ? project.images[0] : '';
      const imgHTML = firstImg ? `<img src="${firstImg}" alt="${project.title}" style="width:100%; height:100%; object-fit:cover; border-radius: var(--radius-md);" />` : `<div class="project-placeholder">[${project.title}]</div>`;
      
      card.innerHTML = `
        <div class="project-img-wrapper" style="height: 250px">
          ${imgHTML}
        </div>
        <h3>${project.title}</h3>
        <p class="project-desc">${Array.isArray(project.description) ? project.description[0] : (project.description || '')}</p>
        <div class="project-tags">${tagsHTML}</div>
        <div class="project-links">
          <button class="btn btn-primary btn-sm detail-btn">
            Details <i data-lucide="external-link"></i>
          </button>
        </div>
        ${isAdmin ? `
          <button class="delete-skill-btn delete-proj-btn admin-only" data-id="${doc.id}" style="top: 10px; right: 10px;"><i data-lucide="trash-2"></i></button>
          <button class="edit-skill-btn edit-proj-btn admin-only" data-id="${doc.id}" style="position:absolute; top: 10px; right: 40px; background: #3498db; color:white; border:none; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:0; transition:opacity 0.2s; z-index:10;"><i data-lucide="edit-2" style="width:12px; height:12px;"></i></button>
        ` : ''}
      `;
      
      carouselTrack.appendChild(card);
      
      if (dotsContainer) {
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('data-index', index);
        dotsContainer.appendChild(dot);
      }
      
      const detailBtn = card.querySelector('.detail-btn');
      if (typeof openProjectModalData === 'function') {
        detailBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openProjectModalData(project, detailBtn);
        });
      }
      
      const editProjBtn = card.querySelector('.edit-proj-btn');
      if (editProjBtn) {
        editProjBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentEditingProjectId = doc.id;
          document.getElementById('addProjectModalTitle').innerText = 'Edit Project';
          document.getElementById('addProjectBtn').innerHTML = 'Update Project <i data-lucide="edit-2"></i>';
          document.getElementById('projTitle').value = project.title || '';
          document.getElementById('projTags').value = (project.tags || []).join(', ');
          document.getElementById('projDesc').value = Array.isArray(project.description) ? project.description.join(', ') : (project.description || '');
          document.getElementById('projDemo').value = project.demoLink || '';
          document.getElementById('projSource').value = project.sourceLink || '';
          
          const existingImages = project.images || [];
          document.getElementById('projImage1').value = existingImages[0] || '';
          document.getElementById('projImage2').value = existingImages[1] || '';
          document.getElementById('projImage3').value = existingImages[2] || '';
          
          document.getElementById('addProjectModal').classList.add('active');
          document.documentElement.classList.add('no-scroll');
          document.body.classList.add('no-scroll');
          history.pushState({ modal: true }, '', '');
          isModalOpen = true;
          lucide.createIcons();
        });
      }
      
      const delBtn = card.querySelector('.delete-proj-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showConfirmDelete(`Are you sure you want to delete ${project.title}?`, () => {
            db.collection('projects').doc(doc.id).delete();
          });
        });
      }
      
      index++;
    });
    
    lucide.createIcons();
    initCarousel();
  });
}

function scrollToCard(index) {
  if (index < 0 || index >= carouselCards.length) return;
  carouselCards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function initCarousel() {
  carouselCards = document.querySelectorAll('.carousel-card');
  dots = document.querySelectorAll('.dot');
  currentIndex = 0;
  
  if (prevBtn) prevBtn.onclick = () => scrollToCard(currentIndex - 1);
  if (nextBtn) nextBtn.onclick = () => scrollToCard(currentIndex + 1);
  
  dots.forEach(dot => {
    dot.onclick = () => scrollToCard(parseInt(dot.getAttribute('data-index')));
  });
  
  const observerOptions = {
    root: carouselWrapper,
    threshold: 0.5
  };
  
  if (carouselWrapper) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Array.from(carouselCards).indexOf(entry.target);
          currentIndex = index;
          
          carouselCards.forEach(c => c.classList.remove('active-card'));
          entry.target.classList.add('active-card');
          
          dots.forEach(d => d.classList.remove('active'));
          if(dots[index]) dots[index].classList.add('active');
        }
      });
    }, observerOptions);
    
    carouselCards.forEach(card => observer.observe(card));
  }
  
  carouselCards.forEach((card, index) => {
    card.onclick = () => scrollToCard(index);
  });
}

migrateProjectsIfEmpty().then(loadProjects);

const originalUpdateEditModeUI2 = updateEditModeUI;
updateEditModeUI = function(active) {
  originalUpdateEditModeUI2(active);
  if (typeof loadProjects === 'function') loadProjects();
  if (typeof loadCertificates === 'function') loadCertificates();
};

// --- Mouse Click Spark Effect ---
document.addEventListener('click', function(e) {
  const numSparks = 8;
  for (let i = 0; i < numSparks; i++) {
    const spark = document.createElement('div');
    spark.classList.add('click-spark');
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 60; 
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const angleDeg = (angle * 180) / Math.PI;

    spark.style.left = e.clientX + 'px';
    spark.style.top = e.clientY + 'px';
    
    // Set custom CSS variables for the keyframe animation
    spark.style.setProperty('--tx', tx + 'px');
    spark.style.setProperty('--ty', ty + 'px');
    spark.style.setProperty('--angle', (angleDeg + 90) + 'deg');
    spark.style.animationDuration = (400 + Math.random() * 300) + 'ms';
    
    document.body.appendChild(spark);

    setTimeout(() => {
      if(spark.parentNode) spark.remove();
    }, 1000);
  }
});


// --- Academic Journey Animations --- 
// Animate the numeric stats on load
  document.querySelectorAll('.aj-num[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isDecimal = el.dataset.decimal === 'true';
    let current = 0;
    const duration = 900;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      current = target * progress;
      el.textContent = isDecimal ? current.toFixed(2) : Math.round(current);
      if(progress < 1) requestAnimationFrame(tick);
      else el.textContent = isDecimal ? target.toFixed(2) : target;
    }
    requestAnimationFrame(tick);
  });

  // Subtle hover lift on cards
  document.querySelectorAll('.aj-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform .25s ease, box-shadow .25s ease';
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 16px 34px rgba(30,60,40,0.12)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 10px 30px rgba(30,60,40,0.06), 0 2px 8px rgba(30,60,40,0.04)';
    });
  });

// --- Scroll to Top for Home Buttons ---
document.querySelectorAll('a[href="#home"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update hash in URL
    history.pushState(null, null, '#home');
  });
});

// --- Modal History & Back Button Logic ---
let isModalOpen = false;

function closeAllModals() {
  if (projectModal && projectModal.classList.contains('active')) {
    projectModal.classList.remove('active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }
  const cModal = document.getElementById('certModal');
  if (cModal && cModal.classList.contains('active')) {
    cModal.classList.remove('active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
    const iframe = document.getElementById('certModalIframe');
    setTimeout(() => { if (iframe) iframe.src = ''; }, 300);
  }
  const lModal = document.getElementById('loginModal');
  if (lModal && lModal.classList.contains('active')) {
    lModal.classList.remove('active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }
  const addModal = document.getElementById('addSkillModal');
  if (addModal && addModal.classList.contains('active')) {
    addModal.classList.remove('active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }
  const addProjModal = document.getElementById('addProjectModal');
  if (addProjModal && addProjModal.classList.contains('active')) {
    addProjModal.classList.remove('active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }
  const addCertModal = document.getElementById('addCertModal');
  if (addCertModal && addCertModal.classList.contains('active')) {
    addCertModal.classList.remove('active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }
}

window.addEventListener('popstate', () => {
  if (isModalOpen) {
    closeAllModals();
    isModalOpen = false;
  }
});

function handleModalClose() {
  if (isModalOpen) {
    history.back(); // Triggers popstate which calls closeAllModals
  } else {
    closeAllModals();
  }
}

// --- Login Modal Logic ---
const loginModal = document.getElementById('loginModal');
const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

if(document.getElementById('editModeBtn')) {
  document.getElementById('editModeBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if(isAdmin) {
      auth.signOut();
      showToast("Edit mode exited successfully!");
      profilePopup.classList.remove('active');
    } else {
      loginModal.classList.add('active');
      document.documentElement.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
      history.pushState({ modal: true }, '', '');
      isModalOpen = true;
      profilePopup.classList.remove('active');
    }
  });
}

if(closeLoginModalBtn) {
  closeLoginModalBtn.addEventListener('click', () => { handleModalClose(); });
}
if(loginModal) {
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) { handleModalClose(); }
  });
}
if(loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const btn = document.getElementById('loginBtn');
    btn.innerHTML = 'Logging in...';
    
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        loginError.style.display = 'none';
        loginForm.reset();
        handleModalClose();
        btn.innerHTML = 'Login <i data-lucide="log-in"></i>';
        lucide.createIcons();
      })
      .catch((error) => {
        loginError.textContent = "Invalid email or password.";
        loginError.style.display = 'block';
        btn.innerHTML = 'Login <i data-lucide="log-in"></i>';
        lucide.createIcons();
      });
  });
}

// --- Project Modal Logic ---
const projectModal = document.getElementById('projectModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalMainImage = document.getElementById('modalMainImage');
const modalThumbnails = document.getElementById('modalThumbnails');
const modalTitle = document.getElementById('modalTitle');
const modalTags = document.getElementById('modalTags');
const modalDesc = document.getElementById('modalDesc');
const modalDemoBtn = document.getElementById('modalDemoBtn');
const modalSourceBtn = document.getElementById('modalSourceBtn');

function openProjectModalData(project, btn) {
  if(project) {
    const rect = btn.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;
    
    const xOffset = clickX - window.innerWidth / 2;
    const yOffset = clickY - window.innerHeight / 2;
    
    const modalContent = projectModal.querySelector('.project-modal-content');
    modalContent.style.transformOrigin = `calc(50% + ${xOffset}px) calc(50% + ${yOffset}px)`;

    modalMainImage.src = (project.images && project.images.length > 0) ? project.images[0] : '';
    modalTitle.textContent = project.title;
    
    modalDesc.innerHTML = '';
    if(Array.isArray(project.description)) {
      project.description.forEach(point => {
        const li = document.createElement('li');
        li.textContent = point;
        modalDesc.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = project.description;
      modalDesc.appendChild(li);
    }
        const formatUrl = (url) => {
      if (!url || url === '#') return '#';
      if (!/^https?:\/\//i.test(url)) return 'https://' + url;
      return url;
    };
    modalDemoBtn.href = formatUrl(project.demoLink);
    modalSourceBtn.href = formatUrl(project.sourceLink);

    
    modalTags.innerHTML = '';
    if (project.tags) {
      project.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'ptag';
        span.textContent = tag.trim();
        modalTags.appendChild(span);
      });
    }
    
    modalThumbnails.innerHTML = '';
    if (project.images) {
      project.images.forEach((imgSrc, imgIndex) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        if(imgIndex === 0) img.classList.add('active');
        img.addEventListener('mouseenter', () => {
          modalMainImage.src = imgSrc;
          modalThumbnails.querySelectorAll('img').forEach(t => t.classList.remove('active'));
          img.classList.add('active');
        });
        modalThumbnails.appendChild(img);
      });
    }

    projectModal.classList.add('active');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    lucide.createIcons();
    
    history.pushState({ modal: true }, '', '');
    isModalOpen = true;
  }
}

if(closeModalBtn) {
  closeModalBtn.addEventListener('click', handleModalClose);
}
if(projectModal) {
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) handleModalClose();
  });
}

// Add Project Form Logic
const openAddProjectModalBtn = document.getElementById('openAddProjectModalBtn');
if (openAddProjectModalBtn) {
  openAddProjectModalBtn.addEventListener('click', () => {
    document.getElementById('addProjectModalTitle').innerText = 'Add New Project';
    document.getElementById('addProjectBtn').innerHTML = 'Add Project <i data-lucide="plus"></i>';
    document.getElementById('addProjectForm').reset();
    currentEditingProjectId = null;
    
    document.getElementById('addProjectModal').classList.add('active');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    history.pushState({ modal: true }, '', '');
    isModalOpen = true;
  });
}

const addProjectForm = document.getElementById('addProjectForm');
if(addProjectForm) {
  addProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('addProjectBtn');
    btn.innerHTML = currentEditingProjectId ? 'Updating...' : 'Adding...';
    
    const img1 = document.getElementById('projImage1').value.trim();
    const img2 = document.getElementById('projImage2').value.trim();
    const img3 = document.getElementById('projImage3').value.trim();
    const imagesArr = [img1, img2, img3].filter(Boolean);
    
    const projData = {
      title: document.getElementById('projTitle').value,
      images: imagesArr,
      tags: document.getElementById('projTags').value.split(',').map(s => s.trim()).filter(s => s),
      description: document.getElementById('projDesc').value.split(',').map(s => s.trim()).filter(s => s),
      demoLink: document.getElementById('projDemo').value,
      sourceLink: document.getElementById('projSource').value
    };
    
    if (currentEditingProjectId) {
      await db.collection('projects').doc(currentEditingProjectId).update(projData);
    } else {
      projData.order = Date.now();
      await db.collection('projects').add(projData);
    }
    
    addProjectForm.reset();
    handleModalClose();
    btn.innerHTML = 'Add Project <i data-lucide="plus"></i>';
    currentEditingProjectId = null;
    lucide.createIcons();
  });
}

const closeAddProjectModalBtn = document.getElementById('closeAddProjectModalBtn');
const addProjectModal = document.getElementById('addProjectModal');
if(closeAddProjectModalBtn) closeAddProjectModalBtn.addEventListener('click', handleModalClose);
if(addProjectModal) addProjectModal.addEventListener('click', (e) => {
  if (e.target === addProjectModal) handleModalClose();
});


// --- Certificate Modal Logic ---
const certModal = document.getElementById('certModal');
const closeCertModalBtn = document.getElementById('closeCertModalBtn');
const certModalIframe = document.getElementById('certModalIframe');

if(closeCertModalBtn) {
  closeCertModalBtn.addEventListener('click', () => {
    handleModalClose();
  });
}

if(certModal) {
  certModal.addEventListener('click', (e) => {
    if (e.target === certModal) {
      handleModalClose();
    }
  });
}

// --- Certificates Dynamic Logic ---
let certsUnsubscribe = null;

async function migrateCertsIfEmpty() {
  const snapshot = await db.collection('certificates').get();
  if (snapshot.empty) {
    const initialCerts = [
      { title: "Python, SQL & Web Tech", issuer: "QSpiders, Punjagutta", year: "2024–2025", iconText: "QS", iconColor: "#2563eb", link: "YOUR_DRIVE_LINK_HERE", order: 1 },
      { title: "Joy of Computing Using Python", issuer: "NPTEL – IIT", year: "2025", iconText: "IIT", iconColor: "#f59e0b", link: "YOUR_DRIVE_LINK_HERE", order: 2 },
      { title: "Software Project Management", issuer: "NPTEL – IIT", year: "2025", iconText: "IIT", iconColor: "#f59e0b", link: "YOUR_DRIVE_LINK_HERE", order: 3 },
      { title: "Privacy & Security", issuer: "NPTEL – IIT", year: "2025", iconText: "IIT", iconColor: "#f59e0b", link: "YOUR_DRIVE_LINK_HERE", order: 4 },
      { title: "Internet of Things (IoT)", issuer: "NPTEL – IIT", year: "2024", iconText: "IIT", iconColor: "#f59e0b", link: "YOUR_DRIVE_LINK_HERE", order: 5 },
      { title: "Cloud Computing", issuer: "NPTEL – IIT", year: "2024", iconText: "IIT", iconColor: "#f59e0b", link: "YOUR_DRIVE_LINK_HERE", order: 6 }
    ];
    for (let c of initialCerts) {
      await db.collection('certificates').add(c);
    }
  }
}

function loadCertificates() {
  if (certsUnsubscribe) certsUnsubscribe();
  
  certsUnsubscribe = db.collection('certificates').orderBy('order', 'asc').onSnapshot(snapshot => {
    const certGrid = document.getElementById('certGrid');
    if (!certGrid) return;
    certGrid.innerHTML = '';
    
    const openAddBtn = document.getElementById('openAddCertModalBtn');
    if (openAddBtn) {
      openAddBtn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
    
    snapshot.forEach(doc => {
      const cert = doc.data();
      const div = document.createElement('div');
      div.className = 'cert-card';
      div.style.position = 'relative';
      div.innerHTML = `
        <div class="cert-icon" style="background: ${cert.iconColor || '#f59e0b'}; color: white">
          ${cert.iconText || 'C'}
        </div>
        <div class="cert-info">
          <h4>${cert.title}</h4>
          <p>${cert.issuer}</p>
          <div class="cert-meta">
            <span>${cert.year}</span>
            <i data-lucide="award"></i>
          </div>
          <button class="btn btn-secondary btn-sm cert-view-btn glass-btn" data-link="${cert.link}">
            <span class="cert-view-text">View</span>
            <i data-lucide="external-link" class="cert-view-icon"></i>
          </button>
        </div>
        ${isAdmin ? `
          <button class="delete-skill-btn delete-cert-btn admin-only" data-id="${doc.id}" style="top: 10px; right: 10px;"><i data-lucide="trash-2"></i></button>
          <button class="edit-skill-btn edit-cert-btn admin-only" data-id="${doc.id}" style="position:absolute; top: 10px; right: 40px; background: #3498db; color:white; border:none; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; cursor:pointer; opacity:0; transition:opacity 0.2s; z-index:10;"><i data-lucide="edit-2" style="width:12px; height:12px;"></i></button>
        ` : ''}
      `;
      
      const viewBtn = div.querySelector('.cert-view-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          let link = viewBtn.getAttribute('data-link');
          if (link) {
            if (link.includes('view?usp=sharing') || link.includes('view')) {
              link = link.replace(/view(\?usp=sharing)?/, 'preview');
            }
            if (certModalIframe) certModalIframe.src = link;
            
            const rect = viewBtn.getBoundingClientRect();
            const clickX = rect.left + rect.width / 2;
            const clickY = rect.top + rect.height / 2;
            const xOffset = clickX - window.innerWidth / 2;
            const yOffset = clickY - window.innerHeight / 2;
            
            const modalContent = certModal.querySelector('.cert-modal-content');
            if (modalContent) modalContent.style.transformOrigin = `calc(50% + ${xOffset}px) calc(50% + ${yOffset}px)`;
            
            if (certModal) certModal.classList.add('active');
            document.documentElement.classList.add('no-scroll');
            document.body.classList.add('no-scroll');
            
            history.pushState({ modal: true }, '', '');
            isModalOpen = true;
          }
        });
      }
      
      const editBtn = div.querySelector('.edit-cert-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentEditingCertId = doc.id;
          document.getElementById('addCertModalTitle').innerText = 'Edit Certificate';
          document.getElementById('addCertBtn').innerHTML = 'Update Certificate <i data-lucide="edit-2"></i>';
          document.getElementById('certTitle').value = cert.title || '';
          document.getElementById('certIssuer').value = cert.issuer || '';
          document.getElementById('certYear').value = cert.year || '';
          document.getElementById('certIconText').value = cert.iconText || '';
          document.getElementById('certIconColor').value = cert.iconColor || '#f59e0b';
          document.getElementById('certLink').value = cert.link || '';
          
          document.getElementById('addCertModal').classList.add('active');
          document.documentElement.classList.add('no-scroll');
          document.body.classList.add('no-scroll');
          history.pushState({ modal: true }, '', '');
          isModalOpen = true;
          lucide.createIcons();
        });
      }
      
      const delBtn = div.querySelector('.delete-cert-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showConfirmDelete(`Are you sure you want to delete ${cert.title}?`, () => {
            db.collection('certificates').doc(doc.id).delete();
          });
        });
      }
      
      certGrid.appendChild(div);
    });
    
    // View more logic for mobile
    const viewMoreBtn = document.getElementById('viewMoreCertsBtn');
    if (viewMoreBtn) {
      if (snapshot.size <= 4) {
        document.getElementById('viewMoreCertsContainer').style.display = 'none';
        certGrid.classList.remove('collapsed');
      } else {
        document.getElementById('viewMoreCertsContainer').style.display = '';
        certGrid.classList.add('collapsed');
        viewMoreBtn.onclick = () => {
          certGrid.classList.remove('collapsed');
          document.getElementById('viewMoreCertsContainer').style.display = 'none';
        };
      }
    }
    
    lucide.createIcons();
  });
}

migrateCertsIfEmpty().then(loadCertificates);

const openAddCertModalBtn = document.getElementById('openAddCertModalBtn');
if (openAddCertModalBtn) {
  openAddCertModalBtn.addEventListener('click', () => {
    document.getElementById('addCertModalTitle').innerText = 'Add New Certificate';
    document.getElementById('addCertBtn').innerHTML = 'Add Certificate <i data-lucide="plus"></i>';
    document.getElementById('addCertForm').reset();
    currentEditingCertId = null;
    
    document.getElementById('addCertModal').classList.add('active');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    history.pushState({ modal: true }, '', '');
    isModalOpen = true;
  });
}

const addCertForm = document.getElementById('addCertForm');
if(addCertForm) {
  addCertForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('addCertBtn');
    btn.innerHTML = currentEditingCertId ? 'Updating...' : 'Adding...';
    
    const certData = {
      title: document.getElementById('certTitle').value,
      issuer: document.getElementById('certIssuer').value,
      year: document.getElementById('certYear').value,
      iconText: document.getElementById('certIconText').value,
      iconColor: document.getElementById('certIconColor').value,
      link: document.getElementById('certLink').value
    };
    
    if (currentEditingCertId) {
      await db.collection('certificates').doc(currentEditingCertId).update(certData);
    } else {
      certData.order = Date.now();
      await db.collection('certificates').add(certData);
    }
    
    addCertForm.reset();
    handleModalClose();
    btn.innerHTML = 'Add Certificate <i data-lucide="plus"></i>';
    currentEditingCertId = null;
    lucide.createIcons();
  });
}

const closeAddCertModalBtn = document.getElementById('closeAddCertModalBtn');
const addCertModal = document.getElementById('addCertModal');
if(closeAddCertModalBtn) closeAddCertModalBtn.addEventListener('click', handleModalClose);
if(addCertModal) addCertModal.addEventListener('click', (e) => {
  if (e.target === addCertModal) handleModalClose();
});

// --- Typewriter Effect ---
const typewriterWords = ["Fullstack Developer", "MCA Postgraduate Student", "Python Developer"];
let typewriterIndex = 0;
let typewriterCharIndex = 0;
let typewriterDeleting = false;

function typeWriterEffect() {
  const target = document.getElementById("typewriter-text");
  if (!target) return;
  
  const currentWord = typewriterWords[typewriterIndex];
  
  if (typewriterDeleting) {
    target.textContent = currentWord.substring(0, typewriterCharIndex - 1);
    typewriterCharIndex--;
  } else {
    target.textContent = currentWord.substring(0, typewriterCharIndex + 1);
    typewriterCharIndex++;
  }
  
  let typingSpeed = typewriterDeleting ? 50 : 100;
  
  if (!typewriterDeleting && target.textContent === currentWord) {
    typingSpeed = 2000;
    typewriterDeleting = true;
  } else if (typewriterDeleting && target.textContent === "") {
    typewriterDeleting = false;
    typewriterIndex = (typewriterIndex + 1) % typewriterWords.length;
    typingSpeed = 500;
  }
  
  setTimeout(typeWriterEffect, typingSpeed);
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(typeWriterEffect, 1000);
});
