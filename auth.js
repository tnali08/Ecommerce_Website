const model=require('../models/eventsInfo');
//To see if the user is a guest
exports.isGuest=(req,res,next)=>
{
    if(!req.session.user)
    {
        return next();
    }
    else
    {
        req.flash('error','You have already logged in');
        return res.redirect('/users/profile');
    }
}

//To see if the user is Logged In
exports.isAuthenticated=(req,res,next)=>
{
    if(req.session.user)
    {
        return next();
    }
    else
    {
        req.flash('error','You must be logged in to view this page');
        return res.redirect('/users/login');
    }
}

//To see if the user is the owner of the event
exports.isAuthorized=(req,res,next)=>{

    let id=req.params.id; 
    model.findById(id).then(event=>{
        if(event)
        {
            if(event.hostName==req.session.user)
            {
                return next();
            }
            else
            {
                let err=new Error('Unauthorized to access the resource');
                err.status=401;
                return next(err);
            }
        }
        else
        {
            let err=new Error("Cannot find an event with id "+ id);
            err.sttus=404;
            next(err);
        }
    }
    ).catch(err=>next(err));
}