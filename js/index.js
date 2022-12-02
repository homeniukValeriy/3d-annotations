import * as THREE from 'three';
import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';


export default class Sketch {
    constructor() {
        this.renderer = new THREE.WebGLRenderer( { 
            alpha: true,
            antialias: true 
        });

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( Math.min(window.devicePixelRatio, 2) );
        this.renderer.setClearColor( 0xaaaaaa, 1 );
        this.renderer.phisicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        this.container = document.getElementById('container');
        this.progressOverlay = document.getElementById('progress-overlay');
        this.progress = document.getElementById('progress');

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.container.appendChild( this.renderer.domElement );

        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 20 );
        this.camera.position.z = 0.3;

        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        })

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        this.raycaster = new THREE.Raycaster();

        this.scene = new THREE.Scene();

        this.clock = new THREE.Clock();

        this.addObjects();

        this.render();
    }

    addObjects() {
        this.points = [
            {
                position: new THREE.Vector3(0.0103148, -0.006981742, 0.03138121),
                element: document.querySelector('.point-0')
            },
            {
                position: new THREE.Vector3(0.050873709, 0.0203039, 0.021715679),
                element: document.querySelector('.point-1')
            },
            {
                position: new THREE.Vector3(0.006961332, 0.02311723, 0.00890365),
                element: document.querySelector('.point-2')
            },
            {
                position: new THREE.Vector3(-0.02723543, 0.02851662, 0.017251429),
                element: document.querySelector('.point-3')
            },
            {
                position: new THREE.Vector3(-0.0245239, 0.034617535, -0.01035874),
                element: document.querySelector('.point-4')
            }
        ];

        
        const manager = new THREE.LoadingManager();
        const loader = new GLTFLoader(manager);

        manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const p = (itemsLoaded / itemsTotal) * 100;
            this.progress.style.width = `${p}%`;
        };

        manager.onLoad = () => {
            this.progress.style.width = `100%`;
            setTimeout(() => {
                this.progressOverlay.style.display = 'none';
            }, 1000);
        };

        this.progress.style.width = `4%`;

        new RGBELoader(manager)
            .load( '/midday_1k.hdr',  ( texture ) => {

            texture.mapping = THREE.EquirectangularReflectionMapping;

            // this.scene.background = texture;
            this.scene.environment = texture;
        });

        loader.load(
            '/argus_camera.glb',
            ( gltf ) => {
                this.model = gltf.scene.children[0];
                
                const box = new THREE.Box3().setFromObject(this.model);
                const center = box.getCenter(new THREE.Vector3());
                
                this.model.position.x += (this.model.position.x - center.x);
                this.model.position.y += (this.model.position.y - center.y);
                this.model.position.z += (this.model.position.z - center.z);

                this.scene.add( this.model );
            }
        );

        
    }

    updateObjects() {
        for (const point of this.points) {
            const screenPosition = point.position.clone();
            screenPosition.project(this.camera);

            this.raycaster.setFromCamera(screenPosition, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children, true);

            if (intersects.length === 0) {
                point.element.classList.add('visible');
            } else {
                const intersectionDistance = intersects[0].distance;
                const pointDistance = point.position.distanceTo(this.camera.position);

                if (pointDistance > intersectionDistance) {
                    point.element.classList.remove('visible');
                } else {
                    point.element.classList.add('visible');
                }
            }

            const translateX = screenPosition.x * this.width * 0.5;
            const translateY = -screenPosition.y * this.height * 0.5;

            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
    }
   
    render() {
        
        this.controls.update();
        this.updateObjects();
        this.renderer.render(this.scene, this.camera);

        window.requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch();

