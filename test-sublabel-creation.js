// Test script to verify sub-label creation payload
// Run this to see what data is being sent to the API

const testPayloads = [
  {
    name: "Test Global Label",
    description: "Should create global label (no userId)"
  },
  {
    name: "Test Private Label",
    userId: "some-user-id-here",
    description: "Should create private label with userId"
  }
];

testPayloads.forEach((test, index) => {
  console.log(`\n=== Test ${index + 1}: ${test.description} ===`);
  
  const payload = {
    name: test.name,
    isGlobal: !test.userId
  };
  
  if (test.userId) {
    payload.userId = test.userId;
  }
  
  console.log('Payload that would be sent:');
  console.log(JSON.stringify(payload, null, 2));
  
  // Simulate backend logic
  const shouldBeGlobal = payload.isGlobal === true || payload.isGlobal === undefined || !payload.userId;
  const labelData = {
    name: payload.name.trim(),
    isGlobal: shouldBeGlobal,
    userId: shouldBeGlobal ? null : payload.userId
  };
  
  console.log('Data that would be saved to DB:');
  console.log(JSON.stringify(labelData, null, 2));
});
