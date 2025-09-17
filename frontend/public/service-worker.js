self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : { title: "Hello!", message: "Test notification" };
  const { title, message } = data;

  event.waitUntil(
    self.registration.showNotification(title, {
      body: message,
      icon: "/vite.png", // optional
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});