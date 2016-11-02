using TheDebateApp.Dtos;
using TheDebateApp.Services;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Description;

namespace TheDebateApp.Controllers
{
    [Authorize]
    [RoutePrefix("api/architectureItem")]
    public class ArchitectureItemController : ApiController
    {
        public ArchitectureItemController(IArchitectureItemService architectureItemService)
        {
            _architectureItemService = architectureItemService;
        }

        [Route("add")]
        [HttpPost]
        [ResponseType(typeof(ArchitectureItemAddOrUpdateResponseDto))]
        public IHttpActionResult Add(ArchitectureItemAddOrUpdateRequestDto dto) { return Ok(_architectureItemService.AddOrUpdate(dto)); }

        [Route("update")]
        [HttpPut]
        [ResponseType(typeof(ArchitectureItemAddOrUpdateResponseDto))]
        public IHttpActionResult Update(ArchitectureItemAddOrUpdateRequestDto dto) { return Ok(_architectureItemService.AddOrUpdate(dto)); }

        [Route("get")]
        [AllowAnonymous]
        [HttpGet]
        [ResponseType(typeof(ICollection<ArchitectureItemDto>))]
        public IHttpActionResult Get() { return Ok(_architectureItemService.Get()); }

        [Route("getById")]
        [HttpGet]
        [ResponseType(typeof(ArchitectureItemDto))]
        public IHttpActionResult GetById(int id) { return Ok(_architectureItemService.GetById(id)); }

        [Route("remove")]
        [HttpDelete]
        [ResponseType(typeof(int))]
        public IHttpActionResult Remove(int id) { return Ok(_architectureItemService.Remove(id)); }

        protected readonly IArchitectureItemService _architectureItemService;


    }
}
