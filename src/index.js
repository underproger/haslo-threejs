import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from 'locomotive-scroll';
import './styles/main.scss';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// Сцена, камера, рендерер
const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 5;

// Используй OrthographicCamera
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 6;

const camera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,  // left
    frustumSize * aspect / 2,  // right
    frustumSize / 2,           // top
    -frustumSize / 2,           // bottom
    0.1,                       // near
    1000                       // far
);

camera.position.set(0, 0, 10); // Камера смотрит вперёд
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('canvas'),
    alpha: true,               // Позволяет сделать фон прозрачным
    antialias: true,
});
renderer.setSize(window.innerWidth / 1.5, window.innerHeight / 1.7);
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
scene.background = null; // Отключает цвет фона

// Свет
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

// Загрузка модели
import modelPath from './assets/model.glb';
import modelPath2 from './assets/model2.glb';

const loader = new GLTFLoader();
let container1, container2; // две модели
let activeContainer; // текущая активная модель

// Загрузка первой модели
loader.load(modelPath, (gltf) => {
    container1 = new THREE.Object3D();
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    container1.rotation.y = 1.6;
    container1.add(model);
    scene.add(container1);
    activeContainer = container1; // первая модель активна
});

// Загрузка второй модели
loader.load(modelPath2, (gltf) => {
    container2 = new THREE.Object3D();
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    container2.rotation.y = 1.6;
    container2.add(model);
    container2.visible = false; // скрыть вторую модель
    scene.add(container2);
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0.5, 0, 0.866); // приблизительно 60°
scene.add(directionalLight);

const rgbeLoader = new RGBELoader();

import hdri from './assets/hdri.hdr';

rgbeLoader.load(hdri, function (texture) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();
});

// Анимация
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;

    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth / 1.8, window.innerHeight / 2);
});


document.addEventListener('DOMContentLoaded', function () {
    const locomotiveScroll = new LocomotiveScroll();
    gsap.registerPlugin(ScrollTrigger);

    const isSafari = () => {
        return (
            ~navigator.userAgent.indexOf('Safari') &&
            navigator.userAgent.indexOf('Chrome') < 0
        );
    };

    const isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (
                isMobile.Android() ||
                isMobile.BlackBerry() ||
                isMobile.iOS() ||
                isMobile.Opera() ||
                isMobile.Windows()
            );
        },
    };

    if (isMobile.any()) {
        document.querySelector('body').classList.add('v-mobile');
        document.querySelector('html').classList.add('v-mobile');
    } else {
        document.querySelector('body').classList.add('v-desk');
        document.querySelector('html').classList.add('v-desk');
    }

    const gotoTargets = document.querySelectorAll('[data-goto]');
    if (gotoTargets) {
        gotoTargets.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();

                const target = document.querySelector(item.dataset.goto);
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            })

        })
    }


    // menu
    const body = document.querySelector("body");
    const bottle = document.querySelector(".bottle");
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const menu = document.querySelector('.header__menu');
    const menuOpen = document.querySelector('.header__burger');
    const menuClose = document.querySelector('.header__menu-close');

    body.style.setProperty('--header', header.offsetHeight + 'px');
    body.style.setProperty('--footer', footer.offsetHeight + 'px');
    body.style.setProperty('--bottle', bottle.offsetHeight + 'px');

    addEventListener("resize", (event) => {
        body.style.setProperty('--header', header.offsetHeight + 'px');
        body.style.setProperty('--footer', footer.offsetHeight + 'px');
        body.style.setProperty('--bottle', bottle.offsetHeight + 'px');
    });


    // if (menu) {
    //     menuOpen.addEventListener('click', function () {
    //         menu.classList.toggle('_active');
    //         body.classList.toggle('_lock');
    //     });
    //     menuClose.addEventListener('click', function () {
    //         menu.classList.toggle('_active');
    //         body.classList.toggle('_lock');
    //     });
    // }

    // const subMenu = document.querySelectorAll('.has_submenu');
    // subMenu.forEach(menu => {
    //     const trigger = menu.querySelector('.has_submenu svg')
    //     trigger.addEventListener('click', function (e) {
    //         e.preventDefault();
    //         if (isMobile.any()) {
    //             menu.classList.toggle('_active');
    //         }
    //     })
    // })

    // window.addEventListener('mousemove', (event) => {
    //     if (!activeContainer) return;
    
    //     const typesBlock = document.querySelector('.types');
    //     const bounds = renderer.domElement.getBoundingClientRect();
    
    //     if (typesBlock) {
    //         const typesRect = typesBlock.getBoundingClientRect();
    //         if (
    //             event.clientX >= typesRect.left &&
    //             event.clientX <= typesRect.right &&
    //             event.clientY >= typesRect.top &&
    //             event.clientY <= typesRect.bottom
    //         ) {
    //             return;
    //         }
    //     }
    
    //     let isTypesInView = false;
    //     if (typesBlock) {
    //         const typesRect = typesBlock.getBoundingClientRect();
    //         if (typesRect.top < window.innerHeight && typesRect.bottom > 0) {
    //             isTypesInView = true;
    //         }
    //     }
    
    //     if (isTypesInView) {
    //         // Возвращаем модель в стандартное положение (или можно оставить текущую позу)
    //         gsap.to(activeContainer.rotation, {
    //             y: 1.6,
    //             z: 0,
    //             duration: 1.6,
    //             ease: 'power2.out'
    //         });
    //     } else {
    //         const mouseX = (event.clientX - bounds.left) / bounds.width;
    //         const centerOffset = (mouseX - 0.5) * Math.PI / 4; // угол относительно центра окна
    //         const rotateZ = -(mouseX - 0.5) * Math.PI / 10;
    
    //         // Используем текущее положение контейнера как базу
    //         const targetY = activeContainer.rotation.y + centerOffset;
    
    //         gsap.to(activeContainer.rotation, {
    //             y: targetY,
    //             z: rotateZ,
    //             duration: 1.6,
    //             ease: 'power2.out'
    //         });
    //     }
    // });
    
    
    


    // window.addEventListener('mouseout', (event) => {
    //     if (!event.relatedTarget || event.relatedTarget.nodeName === "HTML") {
    //         if (!container) return;

    //         gsap.to(container.rotation, {
    //             y: 0,
    //             x: 0,
    //             z: 0,
    //             duration: 1.2,
    //             ease: 'power2.out'
    //         });
    //     }
    // });




    const blocks = document.querySelectorAll(".block");

    gsap.set(bottle, { x: 0, y: 0 });

    blocks.forEach((block, index) => {
        const placeholder = block.querySelector(".block__bottle");
        const nextBlock = blocks[index + 1];

        if (!nextBlock) return;

        const nextPlaceholder = nextBlock.querySelector(".block__bottle");

        const fromPos = () => {
            const r = placeholder.getBoundingClientRect();
            const proportionX = (bottle.getBoundingClientRect().width - r.width) / 2;
            const proportionY = (bottle.getBoundingClientRect().height - r.height) / 2;
            return { x: r.left - proportionX, y: r.top + window.scrollY - proportionY };
        };

        const toPos = () => {
            const r = nextPlaceholder.getBoundingClientRect();
            const proportionX = (bottle.getBoundingClientRect().width - r.width) / 2;
            const proportionY = (bottle.getBoundingClientRect().height - r.height) / 2;
            return { x: r.left - proportionX, y: r.top + window.scrollY - proportionY };
        };

        // start bottle position
        if (index == 0) {
            const from = fromPos();

            gsap.to(bottle, {
                x: from.x,
                y: from.y,
                overwrite: true,
                duration: 0,
                ease: "none"
            });
        }

        ScrollTrigger.create({
            trigger: block,
            start: "top top",
            end: "bottom top+=20%",
            scrub: true,
            onUpdate: self => {
                const progress = self.progress;
                const from = fromPos();
                const to = toPos();

                const x = gsap.utils.interpolate(from.x, to.x, progress);
                const y = gsap.utils.interpolate(from.y, to.y, progress);
                gsap.to(bottle, {
                    x: x,
                    y: y,
                    overwrite: true,
                    duration: 0.7,
                    ease: "power2.out"
                });
            }
        });
    });


    document.querySelectorAll('.section').forEach(section => {
        const bgColor = section.getAttribute('data-bg');

        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onEnter: () => gsap.to("body, header", { backgroundColor: bgColor, duration: 0.5 }),
            onEnterBack: () => gsap.to("body, header", { backgroundColor: bgColor, duration: 0.5 })
        });
    });



    // TYPES
    const typesSection = document.querySelector('.types');
    const typesNextBtn = document.querySelector('.types__next');
    const typeItems = document.querySelectorAll('.types__item');

    let isSwitching = false;

    if (typeItems.length > 0 && typesNextBtn) {
        typesNextBtn.addEventListener('click', () => {
            const activeIndex = Array.from(typeItems).findIndex(item =>
                item.classList.contains('_active')
            );

            // Удаляем активный класс у текущего элемента
            if (activeIndex !== -1) {
                typeItems[activeIndex].classList.remove('_active');
            }

            // Определяем следующий индекс
            const nextIndex = (activeIndex + 1) % typeItems.length;

            // Добавляем активный класс следующему элементу
            setTimeout(() => {
                typeItems[nextIndex].classList.add('_active');
            }, 500)


            if (!container1 || !container2 || isSwitching) return;

            isSwitching = true;

            // Целевая модель
            const targetContainer = activeContainer === container1 ? container2 : container1;
            // Анимация вращения на 360°
            gsap.to(activeContainer.rotation, {
                y: activeContainer.rotation.y + Math.PI, // полный оборот
                duration: 0.4,
                ease: 'power2.in',
                onComplete: () => {
                    // Скрыть текущий контейнер
                    activeContainer.visible = false;
                    // Показать целевой контейнер
                    targetContainer.visible = true;

                    // Плавный переход: анимация вращения до правильного угла у новой модели
                    targetContainer.rotation.y = activeContainer.rotation.y; // установим начальное вращение
                    gsap.to(targetContainer.rotation, {
                        y: targetContainer.rotation.y + Math.PI, // доведём его до нужного угла
                        duration: 0.4,
                        ease: 'power2.out',
                        onComplete: () => {
                            activeContainer = targetContainer; // обновим активный контейнер
                            isSwitching = false; // разрешим следующие клики
                        }
                    });
                }
            });

            const bgColor = typeItems[nextIndex].getAttribute('data-bg');
            const textColor = typeItems[nextIndex].getAttribute('data-text');
            const titleColor = typeItems[nextIndex].getAttribute('data-title');
            const titleBgColor = typeItems[nextIndex].getAttribute('data-title-bg');
            const isNoise = typeItems[nextIndex].getAttribute('data-noise');
            typesSection.dataset.bg = bgColor;
            isNoise == 'true' ? typesSection.classList.add('_bg') : typesSection.classList.remove('_bg');

            ScrollTrigger.create({
                trigger: typesSection,
                start: "top center",
                end: "bottom center",
                onEnter: () => {
                    gsap.to("body, header", { backgroundColor: bgColor, duration: 0.5 });
                    gsap.to(typesSection, { '--color-text': textColor, '--color-title': titleColor, '--color-title-bg': titleBgColor, duration: 0.5 })
                },
                onEnterBack: () => {
                    gsap.to("body, header", { backgroundColor: bgColor, duration: 0.5 });
                    gsap.to(typesSection, { '--color-text': textColor, '--color-title': titleColor, '--color-title-bg': titleBgColor, duration: 0.5 })
                }
            });
        });
    }
});