import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class JobsService {
  private jobStreams = new Map<string, Subject<any>>();

  createJob(jobId: string) {
    const subject = new Subject<any>();

    this.jobStreams.set(jobId, subject);

    return subject;
  }

  getJobStream(jobId: string) {
    const stream = this.jobStreams.get(jobId);
    if (!stream) {
      throw new Error(`job ${jobId} not found`);
    }
    return stream.asObservable().pipe(
      map((data) => ({
        data,
      })),
    );
  }

  emit(jobId: string, data: any) {
    const stream = this.jobStreams.get(jobId);
    if (stream) {
      stream.next(data);
    }
  }

  complete(jobId: string) {
    const stream = this.jobStreams.get(jobId);

    if (stream) {
      stream.complete();
      this.jobStreams.delete(jobId);
    }
  }
}
