import React, { useEffect } from "react";
import "../css/home.css"
import GroceryMock from '../assets/grocerymock.jpg';
import NavBar from '../components/navbar';


const Home = () => {
	useEffect(() => {
		localStorage.removeItem("user_code");
		localStorage.removeItem("group_code");
		localStorage.removeItem("access_token");
		localStorage.removeItem("user_id");
		localStorage.removeItem("refresh_token");
		window.dispatchEvent(new Event("user-auth-changed"));
	}, []);
	return (
		<>
<nav>
  <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <h1 style={{ margin: 0, color: '#d1f5be',fontSize:40 }}>The G List</h1>
      <img src="/src/assets/glistphoto.png" alt="G List" style={{ height: 40, width: 'auto' }} />
    </div>

    <div className="nav-links" style={{ display: 'flex', gap: '12px' }}>
	  <a href="/grocerylists" className="btn">My Lists</a>
      <a href="/signup" className="btn">Sign Up</a>
      <a href="/login" className="btn">Login</a>
    </div>
  </div>
</nav>

			<div className="home-page">

				{/* Main Hero Section */}
				<section className="hero">
					<h1> Share Your</h1>
					<h1>Grocery Lists</h1>
					<h1>With Everyone</h1>

					<div className='hero-subtitle'>
						<p>Create, share, and collaborate on grocery lists with family and friends. Never forget an item again and make shopping a breeze.</p>
					</div>

						<img src={GroceryMock} alt="Grocery mock" className="hero-image" />
					{/* Card-style features like Learn More page */}
					<div className="feature-cards">
						<p>Family Sharing</p> <p>Real-time Sharing</p> <p>Smart Links</p>
					</div>

					

					{/* Buttons */}
					<div className="cta-buttons">
						<a href="/signup" className="btn">Get Started</a>
						<a href="/learnmore" className="btn">Learn More</a>
					</div>
				</section>
			</div>
			
		</>
	);
};

export default Home;
