import { Task } from 'src/app/models/task.model';
import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params } from '@angular/router';
import { List } from 'src/app/models/list.nodel';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: List[];
  tasks: Task[];


  constructor(private taskService: TaskService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
      console.log(params);
      this.taskService.getTasks(params.listId).subscribe((tasks: any[]) => {
        this.tasks = tasks;
      });
    }

    );

    this.taskService.getLists().subscribe((lists: any[]) => {
      console.log(lists);
      this.lists = lists;
    });
  }

  onTaskClick(task: Task) {
    if (task.completed === false) {
    this.taskService.complete(task).subscribe(() => {
      console.log('task completed'); });
      task.completed = true;
    } else {
      this.taskService.uncomplete(task).subscribe(() => {
        console.log('task uncompleted'); });
        task.completed = false
    }
  }



  // createNewList() {
  //   this.taskService.createList('test title').subscribe((res: any) =>{
  //     console.log(res);
  //   })
  // }

}
