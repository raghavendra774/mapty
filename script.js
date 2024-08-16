'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map, mapEvent;

class workout{
    date = new Date();
    id = (Date.now() + ' ').slice(-10);
    
    constructor(coords, distance, duration){
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }
    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()] } ${this.date.getDate()}`;
    }
    
}

class Running extends workout{
    type = 'running';
    constructor(coords, distance, duration, cadence){
        super(coords,distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
        this.type = 'running';
    }

    calcPace(){
        this.pace = this.duration/this.distance;
        return this.pace;
    }
}

class Cycling extends workout{
    type = 'cycling';
    constructor(coords, distance, duration, elevation){
        super(coords,distance, duration);
        this.elevation = elevation;
        this.calcSpeed();
        this.type = 'cycling';
        this._setDescription();
} 
    calcSpeed(){
        this.speed = this.distance/(this.duration/60);
        return this.speed;
    }
}

const run1 = new Running([39, -12], 5.2, 24, 178);
console.log(run1);

class App{
    #map;
    mapEvent;
    #workouts = [];
    constructor(){
        
        this._getPosition();
        form.addEventListener('submit',this._newWorkout.bind(this));
        inputType.addEventListener('change',this._toggleElevationType)
    };

    _getPosition(){
        this.#map = navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
            alert('unable to fetch the location')
        })
    }

    _loadMap(position){
        const {latitude} =position.coords;
        const {longitude} = position.coords;
        const coords = [latitude, longitude];
        console.log(coords);
        this.#map = L.map('map').setView(coords,13);

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click',this._showForm.bind(this));

    }

    _showForm(mapE){
        this.mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationType(){
        console.log("this function is called");
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e){
        const validInputs = (...inputs) =>
        inputs.every(inp => Number.isFinite(inp));
        const allPositives = (...inputs) =>
        inputs.every(inp => inp>0);
        
       

        e.preventDefault();

        // Get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat,lng} = this.mapEvent.latlng;
        let workout;
        if(type=== 'running'){ 
            console.log(type);
            const cadence = +inputCadence.value;
            
            if((!validInputs(distance, duration, cadence))
            ) return alert('Input has to be a +ve num')
            workout = new Running([lat, lng],distance, duration, cadence);
           


        }else{
            const elevation = +inputElevation.value;
            
            if(!validInputs(distance, duration, elevation) ||
            !allPositives(distance, duration)) return (alert('Inputs should be +ve num'))
            workout = new Cycling([lat, lng],distance, duration, elevation);       
        }
        this.#workouts.push(workout);
        console.log(workout);
        

        this.renderWorkoutMarker(workout);
        
        
        
        inputDistance.value = inputCadence.value = inputDistance.value = inputDistance.value = "";
    }

    _renderWorkoutMarker(workout){
        L.marker(workout.coords)
        .addTo(this.#map).bindPopup(L.popup({
            maxWidth : 250,
            minWidth : 150,
            autoClose : false,
            closeOnClick : false,
            className : `${workout.type}-popup`
        })
        ).setPopupContent("workout").openPopup();
    }
}

_renderWorkout(workout)
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;
    if (workout.type === 'running')
        html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `
    if (workout.type === 'cycling')
        html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `;
        form.insertAdjacentHTML('afterend',html);
;

const user1 = new App();

/*if(navigator.geolocation)
    navigator.geolocation.getCurrentPosition(function(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const coords = [latitude, longitude]
        map = L.map('map').setView(coords, 13);
        

        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        

        map.on('click',function(mapE){
            mapEvent = mapE;
            form.classList.remove('hidden');
            inputDistance.focus();
            
        })
    },function(){
        alert('could able to get your position')
    });*/

    

