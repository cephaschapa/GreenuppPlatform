// Get current user information first
fetch('/api/user')
  .then(response => response.json())
  .then(user => {
    console.log('Current user:', user);
    
    // Try to create a marketplace listing
    return fetch('/api/marketplace/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Fresh Organic Tomatoes',
        description: 'Locally grown organic tomatoes, perfect for salads and cooking.',
        price: 15.99,
        quantity: 50,
        unit: 'kg',
        category: 'Vegetables',
        images: [],
        sellerId: user.id,
        locationId: 1
      })
    });
  })
  .then(response => response.json())
  .then(result => {
    console.log('Create listing result:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
