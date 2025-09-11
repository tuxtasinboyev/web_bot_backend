import { Module } from "@nestjs/common";
import { FileStreamerController } from "./services/file.stream.controller";
import { FileStreamService } from "./services/file.stream.service";


@Module(
    {
        controllers : [FileStreamerController],
        providers : [FileStreamService]
    }
)
export class CoreModule{

}