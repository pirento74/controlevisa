async function run() {
  const r1 = await fetch('http://localhost:3000/api/settings', {
    method: 'PUT', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({neighborhoods: ['NewB', 'NewC']})
  });
  console.log('1. PUT neighborhoods:', await r1.json());
  
  const r2 = await fetch('http://localhost:3000/api/settings', {
    method: 'GET', headers: {'Content-Type': 'application/json'}
  });
  console.log('2. GET settings:', await r2.json());
  
  const r3 = await fetch('http://localhost:3000/api/settings', {
    method: 'PUT', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({activities: ['Act 99']})
  });
  console.log('3. PUT activities:', await r3.json());
}
run();
