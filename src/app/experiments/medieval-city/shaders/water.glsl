// Vertex Shader
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uWaveHeight;
uniform float uWaveFrequency;
uniform float uWaveSpeed;

void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;

    // Wave animation
    float wave1 = sin(position.x * uWaveFrequency + uTime * uWaveSpeed) * 
                 sin(position.z * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight;
    float wave2 = sin(position.x * uWaveFrequency * 2.0 + uTime * uWaveSpeed * 1.5) * 
                 sin(position.z * uWaveFrequency * 2.0 + uTime * uWaveSpeed * 1.5) * uWaveHeight * 0.5;
    
    vec3 newPosition = position;
    newPosition.y += wave1 + wave2;

    // Calculate normal based on wave height
    vec3 newNormal = normalize(vec3(
        -cos(position.x * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight,
        1.0,
        -cos(position.z * uWaveFrequency + uTime * uWaveSpeed) * uWaveHeight
    ));
    vNormal = newNormal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}

// Fragment Shader
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform vec3 uWaterColor;
uniform vec3 uFoamColor;
uniform float uFoamThreshold;

void main() {
    // Base water color
    vec3 color = uWaterColor;

    // Add foam based on wave height
    float foam = smoothstep(uFoamThreshold - 0.1, uFoamThreshold + 0.1, vPosition.y);
    color = mix(color, uFoamColor, foam * 0.5);

    // Add sparkles
    float sparkle = pow(max(dot(normalize(vNormal), normalize(vec3(1.0, 1.0, 1.0))), 0.0), 32.0);
    color += sparkle * 0.5;

    // Add wave ripples
    float ripple = sin(vUv.x * 50.0 + uTime) * sin(vUv.y * 50.0 + uTime) * 0.1;
    color += ripple;

    gl_FragColor = vec4(color, 0.9);
}