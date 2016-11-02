using TheDebateApp.Dtos;
using TheDebateApp.Services;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Description;

namespace TheDebateApp.Controllers
{
    [Authorize]
    [RoutePrefix("api/architecture")]
    public class ArchitectureController : ApiController
    {
        public ArchitectureController(IArchitectureService architectureService)
        {
            _architectureService = architectureService;
        }

        [Route("add")]
        [HttpPost]
        [ResponseType(typeof(ArchitectureAddOrUpdateResponseDto))]
        public IHttpActionResult Add(ArchitectureAddOrUpdateRequestDto dto) { return Ok(_architectureService.AddOrUpdate(dto)); }

        [Route("update")]
        [HttpPut]
        [ResponseType(typeof(ArchitectureAddOrUpdateResponseDto))]
        public IHttpActionResult Update(ArchitectureAddOrUpdateRequestDto dto) { return Ok(_architectureService.AddOrUpdate(dto)); }

        [Route("get")]
        [AllowAnonymous]
        [HttpGet]
        [ResponseType(typeof(ICollection<ArchitectureDto>))]
        public IHttpActionResult Get() { return Ok(_architectureService.Get()); }

        [Route("getById")]
        [HttpGet]
        [ResponseType(typeof(ArchitectureDto))]
        public IHttpActionResult GetById(int id) { return Ok(_architectureService.GetById(id)); }

        [Route("remove")]
        [HttpDelete]
        [ResponseType(typeof(int))]
        public IHttpActionResult Remove(int id) { return Ok(_architectureService.Remove(id)); }

        protected readonly IArchitectureService _architectureService;


    }
}
