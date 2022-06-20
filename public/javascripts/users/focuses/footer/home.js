

var URLactual = window.location;

if(URLactual == 'http://localhost:8080/Dintair'){
	document.getElementById('homeimg').src='/images/users/icons/world_footer_focus.png'
}

if(URLactual == 'http://localhost:8080/Dintair/recommendations/board'){
	document.getElementById('clientes').src='/images/users/icons/compass_footer_focus.png'
}

if(URLactual == 'http://localhost:8080/Dintair/kindProduct'){
	document.getElementById('productos').src='/images/users/icons/productos_footer_focus.png'
}

if(URLactual == 'http://localhost:8080/Dintair/profile/user'){
	document.getElementById('perfil').src='/images/users/icons/profile_footer_focus.png'
}


