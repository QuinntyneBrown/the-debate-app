using TheDebateApp.Dtos;
using TheDebateApp.Services;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Description;

namespace TheDebateApp.Controllers
{
    [RoutePrefix("api/meeting")]
    public class MeetingController : ApiController
    {
        public MeetingController(IMeetingService meetingService)
        {
            _meetingService = meetingService;
        }

        [Route("add")]
        [HttpPost]
        [ResponseType(typeof(MeetingAddOrUpdateResponseDto))]
        public IHttpActionResult Add(MeetingAddOrUpdateRequestDto dto) { return Ok(_meetingService.AddOrUpdate(dto)); }

        [Route("update")]
        [HttpPut]
        [ResponseType(typeof(MeetingAddOrUpdateResponseDto))]
        public IHttpActionResult Update(MeetingAddOrUpdateRequestDto dto) { return Ok(_meetingService.AddOrUpdate(dto)); }

        [Route("get")]
        [AllowAnonymous]
        [HttpGet]
        [ResponseType(typeof(ICollection<MeetingDto>))]
        public IHttpActionResult Get() { return Ok(_meetingService.Get()); }

        [Route("getById")]
        [HttpGet]
        [ResponseType(typeof(MeetingDto))]
        public IHttpActionResult GetById(int id) { return Ok(_meetingService.GetById(id)); }

        [Route("remove")]
        [HttpDelete]
        [ResponseType(typeof(int))]
        public IHttpActionResult Remove(int id) { return Ok(_meetingService.Remove(id)); }

        protected readonly IMeetingService _meetingService;


    }
}
