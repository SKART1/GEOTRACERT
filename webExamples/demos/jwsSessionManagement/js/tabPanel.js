/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function(){
	
	$('.tab_panel').find('#functional_box_header').find('a').each(function(id,el){
		
		
		
		$(el).click(function(ev){
			console.log($(el).attr('name'));
			$('.tab_panel').find('#functional_box_header').find('.pressed').removeClass('pressed');
			$(el).addClass('pressed');
//			$('.tab_panel').find('#functional_box_content').find('.tab_element').hide();
//			$('.tab_panel').find('#functional_box_content').find('.'+$(el).attr('name')).show(); 
			$('.tab_panel').find('#functional_box_content').find('.tab_element').hide()
			$('.tab_panel').find('#functional_box_content').find('.'+$(el).attr('name')).fadeIn(); 
			
		});
		
	});
	
	
	
	
	
	
});
